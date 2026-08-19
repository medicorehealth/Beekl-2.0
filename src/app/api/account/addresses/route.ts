import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** CRUD for the current user's own addresses. Always scoped to the session user. */

const createSchema = z.object({
    fullName: z.string().min(2).max(80),
    line1: z.string().min(3).max(120),
    line2: z.string().max(120).optional().or(z.literal("")),
    city: z.string().min(2).max(60),
    state: z.string().min(2).max(60),
    postal: z.string().min(3).max(12),
    country: z.string().min(2).max(60),
    phone: z.string().max(20).optional().or(z.literal("")),
});

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid address." }, { status: 400 });
    }

    const count = await prisma.address.count({ where: { userId: user.id } });

    const address = await prisma.address.create({
        data: {
            userId: user.id,
            fullName: parsed.data.fullName,
            line1: parsed.data.line1,
            line2: parsed.data.line2 || null,
            city: parsed.data.city,
            state: parsed.data.state,
            postal: parsed.data.postal,
            country: parsed.data.country,
            phone: parsed.data.phone || null,
            isDefault: count === 0, // first address becomes default
        },
        select: { id: true },
    });

    return NextResponse.json({ ok: true, id: address.id });
}

export async function DELETE(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    // Scope the delete to the owner so users can't delete others' addresses.
    await prisma.address.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
}
