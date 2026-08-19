import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Returns the authenticated user's wishlist as lightweight product cards.
 * Uses the local ProductReference (with deterministic demo pricing) so the
 * wishlist renders even when Shopify isn't connected.
 */
export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: [] });

    const items = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            product: {
                include: {
                    creator: { select: { handle: true, displayName: true } },
                    community: { select: { slug: true, name: true } },
                },
            },
        },
    });

    return NextResponse.json({
        items: items.map((i) => ({
            productReferenceId: i.productReferenceId,
            handle: i.product.handle,
            title: i.product.title,
            creatorHandle: i.product.creator?.handle ?? null,
        })),
    });
}
