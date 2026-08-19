"use client";

import { ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Quick-add button used on product cards. */
export function QuickAddButton({
    variantId,
    className,
}: {
    variantId?: string | null;
    className?: string;
}) {
    const { addItem, loading } = useCart();

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (variantId) addItem(variantId, 1);
            }}
            disabled={!variantId || loading}
            className={cn(
                "flex h-10 w-full items-center justify-center gap-2 rounded-full bg-ink text-xs font-bold uppercase tracking-wide text-paper transition-all hover:bg-charcoal disabled:opacity-50",
                className
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <ShoppingBag className="h-4 w-4" />
                    Quick Add
                </>
            )}
        </button>
    );
}

/** Full add-to-cart button used on the product page. */
export function AddToCartButton({
    variantId,
    disabled,
    quantity = 1,
    label = "Add to Cart",
}: {
    variantId?: string | null;
    disabled?: boolean;
    quantity?: number;
    label?: string;
}) {
    const { addItem, loading, configured } = useCart();

    if (!configured) {
        return (
            <Button variant="secondary" size="lg" fullWidth disabled>
                Checkout not connected
            </Button>
        );
    }

    return (
        <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={disabled || !variantId || loading}
            onClick={() => variantId && addItem(variantId, quantity)}
        >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
        </Button>
    );
}
