import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Cast (or retract) a vote on a contest submission. One vote per user per
 * submission. Only allowed while the contest is in VOTING. Vote count is
 * maintained server-side — never trusted from the client.
 */
const schema = z.object({ contestSubmissionId: z.string().min(1) });

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const submission = await prisma.contestSubmission.findUnique({
        where: { id: parsed.data.contestSubmissionId },
        include: { contest: { select: { status: true } } },
    });
    if (!submission) {
        return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    if (submission.contest.status !== "VOTING") {
        return NextResponse.json(
            { error: "Voting is not open for this contest." },
            { status: 409 }
        );
    }

    // Toggle vote in a transaction and keep the counter accurate.
    const existing = await prisma.contestVote.findUnique({
        where: {
            contestSubmissionId_userId: {
                contestSubmissionId: submission.id,
                userId: user.id,
            },
        },
    });

    if (existing) {
        await prisma.$transaction([
            prisma.contestVote.delete({ where: { id: existing.id } }),
            prisma.contestSubmission.update({
                where: { id: submission.id },
                data: { voteCount: { decrement: 1 } },
            }),
        ]);
        return NextResponse.json({ ok: true, voted: false });
    }

    await prisma.$transaction([
        prisma.contestVote.create({
            data: { contestSubmissionId: submission.id, userId: user.id },
        }),
        prisma.contestSubmission.update({
            where: { id: submission.id },
            data: { voteCount: { increment: 1 } },
        }),
    ]);
    return NextResponse.json({ ok: true, voted: true });
}
