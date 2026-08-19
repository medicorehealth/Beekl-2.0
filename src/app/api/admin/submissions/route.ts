import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";

/**
 * Admin submission moderation: approve / reject / request changes / convert.
 * Guarded by "submissions.moderate".
 */
const schema = z.object({
    submissionId: z.string().min(1),
    action: z.enum(["approve", "reject", "request_changes", "convert"]),
    note: z.string().max(1000).optional(),
});

const STATUS: Record<string, "APPROVED" | "REJECTED" | "UNDER_REVIEW" | "CONVERTED_TO_PRODUCT"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    request_changes: "UNDER_REVIEW",
    convert: "CONVERTED_TO_PRODUCT",
};

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("submissions.moderate");
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { submissionId, action, note } = parsed.data;

    const submission = await prisma.designSubmission.findUnique({
        where: { id: submissionId },
        include: { user: { include: { creator: true } } },
    });
    if (!submission) {
        return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    await prisma.designSubmission.update({
        where: { id: submissionId },
        data: { status: STATUS[action], adminNote: note ?? undefined },
    });

    // When converting to a product, create a DRAFT ProductReference tied to the
    // submitting creator (if they have one). Real commerce sync to Shopify would
    // happen in a separate publish step.
    if (action === "convert") {
        const creator = submission.user.creator;
        const base =
            submission.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
            "product";
        let handle = base;
        let n = 1;
        while (await prisma.productReference.findUnique({ where: { handle } })) {
            handle = `${base}-${n++}`;
        }
        await prisma.productReference.create({
            data: {
                handle,
                title: submission.title,
                status: "DRAFT",
                source: "MANUAL",
                story: submission.description,
                creatorId: creator?.id ?? null,
                communityId: submission.communityId,
                tags: submission.category ? [submission.category.toLowerCase()] : [],
            },
        });
    }

    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: `submission.${action}`, target: submissionId },
    });

    return NextResponse.json({ ok: true });
}
