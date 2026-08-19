import { NextResponse } from "next/server";
import { z } from "zod";
import { isStorefrontConfigured } from "@/lib/shopify/types";
import {
    addToCart,
    createCart,
    getCart,
    removeCartLine,
    updateCartLine,
} from "@/lib/shopify/storefront";

/**
 * Cart API — proxies Shopify Storefront cart operations server-side.
 * Shopify remains the source of truth for cart + checkout. If Shopify isn't
 * configured we return `{ configured: false }` so the UI shows a clear state.
 */

function notConfigured() {
    return NextResponse.json({ configured: false, cart: null });
}

// GET /api/cart?cartId=...
export async function GET(req: Request) {
    if (!isStorefrontConfigured()) return notConfigured();
    const { searchParams } = new URL(req.url);
    const cartId = searchParams.get("cartId");
    if (!cartId) return NextResponse.json({ configured: true, cart: null });
    try {
        const cart = await getCart(cartId);
        return NextResponse.json({ configured: true, cart });
    } catch {
        return NextResponse.json({ configured: true, cart: null }, { status: 200 });
    }
}

const addSchema = z.object({
    cartId: z.string().nullable().optional(),
    merchandiseId: z.string().min(1),
    quantity: z.number().int().positive().max(20).default(1),
});

// POST /api/cart — add an item (creates a cart if needed)
export async function POST(req: Request) {
    if (!isStorefrontConfigured()) return notConfigured();
    const parsed = addSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { cartId, merchandiseId, quantity } = parsed.data;

    try {
        let id = cartId ?? null;
        if (!id) {
            const created = await createCart();
            id = created?.id ?? null;
        }
        if (!id) {
            return NextResponse.json({ error: "Could not create cart." }, { status: 500 });
        }
        const cart = await addToCart(id, [{ merchandiseId, quantity }]);
        return NextResponse.json({ configured: true, cart });
    } catch {
        return NextResponse.json({ error: "Could not add to cart." }, { status: 500 });
    }
}

const updateSchema = z.object({
    cartId: z.string().min(1),
    lineId: z.string().min(1),
    quantity: z.number().int().min(0).max(20),
});

// PATCH /api/cart — update a line quantity
export async function PATCH(req: Request) {
    if (!isStorefrontConfigured()) return notConfigured();
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { cartId, lineId, quantity } = parsed.data;
    try {
        const cart =
            quantity === 0
                ? await removeCartLine(cartId, lineId)
                : await updateCartLine(cartId, lineId, quantity);
        return NextResponse.json({ configured: true, cart });
    } catch {
        return NextResponse.json({ error: "Could not update cart." }, { status: 500 });
    }
}

const removeSchema = z.object({
    cartId: z.string().min(1),
    lineId: z.string().min(1),
});

// DELETE /api/cart — remove a line
export async function DELETE(req: Request) {
    if (!isStorefrontConfigured()) return notConfigured();
    const parsed = removeSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { cartId, lineId } = parsed.data;
    try {
        const cart = await removeCartLine(cartId, lineId);
        return NextResponse.json({ configured: true, cart });
    } catch {
        return NextResponse.json({ error: "Could not remove item." }, { status: 500 });
    }
}
