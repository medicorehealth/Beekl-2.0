import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

/**
 * Registration endpoint.
 *
 * SECURITY: A user can ONLY ever be created as CUSTOMER or (self-service)
 * CREATOR. The role is derived server-side from a controlled `as` flag —
 * the client can never set an arbitrary role (e.g. ADMIN). Elevated roles are
 * assigned only by a SUPER_ADMIN via the admin panel.
 */

const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    phone: z.string().max(20).optional().or(z.literal("")),
    as: z.enum(["customer", "creator"]).optional(),
});

export async function POST(req: Request) {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input." },
            { status: 400 }
        );
    }

    const { name, email, password, phone, as } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
    });
    if (existing) {
        return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Only CUSTOMER or CREATOR self-signup is permitted here.
    const role = as === "creator" ? "CREATOR" : "CUSTOMER";

    const user = await prisma.user.create({
        data: {
            name,
            email: normalizedEmail,
            passwordHash,
            phone: phone || null,
            role,
        },
        select: { id: true, name: true, role: true },
    });

    // If registering as a creator, create a PENDING creator profile that an
    // admin must approve before it goes live.
    if (role === "CREATOR") {
        const baseHandle = slugify(name) || "creator";
        let handle = baseHandle;
        let n = 1;
        // Ensure a unique handle.
        while (await prisma.creator.findUnique({ where: { handle } })) {
            handle = `${baseHandle}-${n++}`;
        }
        await prisma.creator.create({
            data: {
                userId: user.id,
                handle,
                displayName: name,
                status: "PENDING",
            },
        });
    }

    return NextResponse.json({ ok: true, userId: user.id, role: user.role });
}
