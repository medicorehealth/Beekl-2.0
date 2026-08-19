import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Update the current user's own profile. A user can ONLY update their own
 * name/phone/image — never their role, email uniqueness, or another user.
 */
const schema = z.object({
    name: z.string().min(2).max(80),
    phone: z.string().max(20).optional().or(z.literal("")),
    image: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            name: parsed.data.name,
            phone: parsed.data.phone || null,
            image: parsed.data.image || undefined,
        },
    });
    return NextResponse.json({ ok: true });
}
