import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Wishlist API — persists per authenticated user. Requires a session. */

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ productReferenceIds: [] });

    const items = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        select: { productReferenceId: true },
    });
    return NextResponse.json({
        productReferenceIds: items.map((i) => i.productReferenceId),
    });
}

const bodySchema = z.object({ productReferenceId: z.string().min(1) });

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Verify the product exists before adding.
    const product = await prisma.productReference.findUnique({
        where: { id: parsed.data.productReferenceId },
        select: { id: true },
    });
    if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await prisma.wishlistItem.upsert({
        where: {
            userId_productReferenceId: {
                userId: user.id,
                productReferenceId: product.id,
            },
        },
        create: { userId: user.id, productReferenceId: product.id },
        update: {},
    });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
        where: {
            userId: user.id,
            productReferenceId: parsed.data.productReferenceId,
        },
    });
    return NextResponse.json({ ok: true });
}
