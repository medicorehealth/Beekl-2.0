"use client";

import * as React from "react";
import type { ShopifyCart } from "@/lib/shopify/types";
import { useToast } from "@/components/ui/Toast";

type CartContextValue = {
    cart: ShopifyCart | null;
    loading: boolean;
    configured: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
    addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
    updateItem: (lineId: string, quantity: number) => Promise<void>;
    removeItem: (lineId: string) => Promise<void>;
    count: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function useCart() {
    const ctx = React.useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}

const CART_ID_KEY = "beekl_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const [cart, setCart] = React.useState<ShopifyCart | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [configured, setConfigured] = React.useState(true);
    const [open, setOpen] = React.useState(false);

    // Hydrate the cart from an existing cart id (if any).
    React.useEffect(() => {
        const cartId = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null;
        if (!cartId) return;
        (async () => {
            try {
                const res = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
                const data = await res.json();
                if (data.configured === false) {
                    setConfigured(false);
                    return;
                }
                if (data.cart) setCart(data.cart);
                else localStorage.removeItem(CART_ID_KEY);
            } catch {
                /* silent — cart simply stays empty */
            }
        })();
    }, []);

    const persist = React.useCallback((next: ShopifyCart | null) => {
        setCart(next);
        if (next?.id) localStorage.setItem(CART_ID_KEY, next.id);
    }, []);

    const addItem = React.useCallback(
        async (merchandiseId: string, quantity = 1) => {
            setLoading(true);
            try {
                const cartId = localStorage.getItem(CART_ID_KEY);
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartId, merchandiseId, quantity }),
                });
                const data = await res.json();
                if (data.configured === false) {
                    setConfigured(false);
                    toast("Checkout isn't connected yet.", "warning");
                    return;
                }
                if (data.cart) {
                    persist(data.cart);
                    setOpen(true);
                    toast("Added to bag.", "success");
                } else {
                    toast("Couldn't add to bag.", "error");
                }
            } catch {
                toast("Something went wrong. Try again.", "error");
            } finally {
                setLoading(false);
            }
        },
        [persist, toast]
    );

    const updateItem = React.useCallback(
        async (lineId: string, quantity: number) => {
            if (!cart) return;
            setLoading(true);
            try {
                const res = await fetch("/api/cart", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartId: cart.id, lineId, quantity }),
                });
                const data = await res.json();
                if (data.cart) persist(data.cart);
            } catch {
                toast("Couldn't update the bag.", "error");
            } finally {
                setLoading(false);
            }
        },
        [cart, persist, toast]
    );

    const removeItem = React.useCallback(
        async (lineId: string) => {
            if (!cart) return;
            setLoading(true);
            try {
                const res = await fetch("/api/cart", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartId: cart.id, lineId }),
                });
                const data = await res.json();
                if (data.cart) persist(data.cart);
            } catch {
                toast("Couldn't remove item.", "error");
            } finally {
                setLoading(false);
            }
        },
        [cart, persist, toast]
    );

    const value: CartContextValue = {
        cart,
        loading,
        configured,
        open,
        setOpen,
        addItem,
        updateItem,
        removeItem,
        count: cart?.totalQuantity ?? 0,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
