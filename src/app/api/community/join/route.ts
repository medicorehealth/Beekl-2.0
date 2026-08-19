import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Join / leave a community. Requires an authenticated session. */

const schema = z.object({ communityId: z.string().min(1) });

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const community = await prisma.community.findUnique({
        where: { id: parsed.data.communityId },
        select: { id: true },
    });
    if (!community) {
        return NextResponse.json({ error: "Community not found." }, { status: 404 });
    }

    await prisma.communityMember.upsert({
        where: {
            communityId_userId: { communityId: community.id, userId: user.id },
        },
        create: { communityId: community.id, userId: user.id },
        update: {},
    });
    return NextResponse.json({ ok: true, joined: true });
}

export async function DELETE(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await prisma.communityMember.deleteMany({
        where: { communityId: parsed.data.communityId, userId: user.id },
    });
    return NextResponse.json({ ok: true, joined: false });
}
