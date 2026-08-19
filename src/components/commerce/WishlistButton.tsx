"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { cn } from "@/lib/utils";

export function WishlistButton({
    productReferenceId,
    className,
    size = "md",
}: {
    productReferenceId?: string | null;
    className?: string;
    size?: "sm" | "md";
}) {
    const { isWishlisted, toggle } = useWishlist();
    const active = productReferenceId ? isWishlisted(productReferenceId) : false;

    if (!productReferenceId) return null;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(productReferenceId);
            }}
            aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={active}
            className={cn(
                "flex items-center justify-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-all hover:scale-110",
                size === "sm" ? "h-8 w-8" : "h-10 w-10",
                className
            )}
        >
            <Heart
                className={cn(
                    size === "sm" ? "h-4 w-4" : "h-5 w-5",
                    active ? "fill-flame text-flame" : "text-ink"
                )}
            />
        </button>
    );
}
