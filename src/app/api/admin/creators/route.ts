import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";
import { slugify } from "@/lib/utils";

/**
 * Admin creator management: approve / reject / suspend / restore / feature.
 * Guarded by "creators.manage". On first approval we auto-create the creator's
 * community (DRAFT→APPROVED) so their public hub exists.
 */
const schema = z.object({
    creatorId: z.string().min(1),
    action: z.enum(["approve", "reject", "suspend", "restore", "feature", "unfeature"]),
});

const STATUS_BY_ACTION: Record<string, "APPROVED" | "REJECTED" | "SUSPENDED"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    suspend: "SUSPENDED",
    restore: "APPROVED",
};

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("creators.manage");
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { creatorId, action } = parsed.data;

    const creator = await prisma.creator.findUnique({
        where: { id: creatorId },
        include: { communities: { select: { id: true } } },
    });
    if (!creator) {
        return NextResponse.json({ error: "Creator not found." }, { status: 404 });
    }

    if (action === "feature" || action === "unfeature") {
        await prisma.creator.update({
            where: { id: creatorId },
            data: { isFeatured: action === "feature" },
        });
    } else {
        const status = STATUS_BY_ACTION[action];
        await prisma.creator.update({ where: { id: creatorId }, data: { status } });

        // Ensure a community exists once approved.
        if (status === "APPROVED" && creator.communities.length === 0) {
            const base = slugify(creator.displayName) || creator.handle;
            let slug = base;
            let n = 1;
            while (await prisma.community.findUnique({ where: { slug } })) {
                slug = `${base}-${n++}`;
            }
            await prisma.community.create({
                data: {
                    creatorId: creator.id,
                    slug,
                    name: `${creator.displayName}'s Community`,
                    status: "APPROVED",
                },
            });
        }
    }

    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: `creator.${action}`, target: creatorId },
    });

    return NextResponse.json({ ok: true });
}
