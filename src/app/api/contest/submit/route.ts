import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Submit an entry to the current contest. Requires auth. Enforces the contest's
 * per-user submission limit server-side. Only OPEN contests accept entries.
 */
const schema = z.object({
    contestId: z.string().min(1),
    title: z.string().min(2).max(120),
    description: z.string().max(2000).optional(),
    images: z.array(z.string().url()).max(5).optional(),
});

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
            { status: 400 }
        );
    }

    const { contestId, title, description, images } = parsed.data;

    const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        select: { id: true, status: true, submissionLimitPerUser: true },
    });
    if (!contest) {
        return NextResponse.json({ error: "Contest not found." }, { status: 404 });
    }
    if (contest.status !== "OPEN") {
        return NextResponse.json(
            { error: "This contest is not accepting submissions right now." },
            { status: 409 }
        );
    }

    const existingCount = await prisma.contestSubmission.count({
        where: { contestId, userId: user.id },
    });
    if (existingCount >= contest.submissionLimitPerUser) {
        return NextResponse.json(
            { error: `You've reached the limit of ${contest.submissionLimitPerUser} entries.` },
            { status: 409 }
        );
    }

    const submission = await prisma.contestSubmission.create({
        data: {
            contestId,
            userId: user.id,
            title,
            description: description || null,
            images: images ?? [],
            status: "SUBMITTED",
        },
        select: { id: true },
    });

    return NextResponse.json({ ok: true, submissionId: submission.id });
}
