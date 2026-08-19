import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCreatorApi } from "@/lib/api-guards";

/**
 * Creator design submission. Creates a DesignSubmission the admin will review.
 * Guarded so only authenticated creators (or admins) can submit.
 */
const schema = z.object({
    title: z.string().min(2).max(120),
    description: z.string().max(2000).optional(),
    category: z.string().max(60).optional(),
    communityId: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    references: z.array(z.string().url()).max(5).optional(),
});

export async function POST(req: Request) {
    const guard = await requireCreatorApi();
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
            { status: 400 }
        );
    }

    const { title, description, category, communityId, imageUrl, references } = parsed.data;

    // If a community is specified, ensure it belongs to this creator.
    if (communityId) {
        const community = await prisma.community.findFirst({
            where: { id: communityId, creatorId: guard.user.creatorId ?? undefined },
            select: { id: true },
        });
        if (!community) {
            return NextResponse.json(
                { error: "Invalid community." },
                { status: 400 }
            );
        }
    }

    const submission = await prisma.designSubmission.create({
        data: {
            userId: guard.user.id,
            communityId: communityId || null,
            title,
            description: description || null,
            category: category || null,
            images: imageUrl ? [imageUrl] : [],
            references: references ?? [],
            status: "NEW",
        },
        select: { id: true },
    });

    return NextResponse.json({ ok: true, submissionId: submission.id });
}
