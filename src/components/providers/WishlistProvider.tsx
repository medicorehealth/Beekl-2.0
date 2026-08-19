"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";

type WishlistContextValue = {
    ids: Set<string>;
    isWishlisted: (productReferenceId: string) => boolean;
    toggle: (productReferenceId: string) => Promise<void>;
    count: number;
};

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function useWishlist() {
    const ctx = React.useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [ids, setIds] = React.useState<Set<string>>(new Set());

    // Load the authenticated user's wishlist.
    React.useEffect(() => {
        if (!session?.user) {
            setIds(new Set());
            return;
        }
        (async () => {
            try {
                const res = await fetch("/api/wishlist");
                if (!res.ok) return;
                const data = await res.json();
                setIds(new Set<string>(data.productReferenceIds ?? []));
            } catch {
                /* silent */
            }
        })();
    }, [session?.user]);

    const toggle = React.useCallback(
        async (productReferenceId: string) => {
            if (!session?.user) {
                toast("Sign in to save to your wishlist.", "info");
                return;
            }
            // Optimistic update
            const next = new Set(ids);
            const wasWishlisted = next.has(productReferenceId);
            if (wasWishlisted) next.delete(productReferenceId);
            else next.add(productReferenceId);
            setIds(next);

            try {
                const res = await fetch("/api/wishlist", {
                    method: wasWishlisted ? "DELETE" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productReferenceId }),
                });
                if (!res.ok) throw new Error();
                toast(wasWishlisted ? "Removed from wishlist." : "Saved to wishlist.", "success");
            } catch {
                // Revert on failure
                setIds((prev) => {
                    const reverted = new Set(prev);
                    if (wasWishlisted) reverted.add(productReferenceId);
                    else reverted.delete(productReferenceId);
                    return reverted;
                });
                toast("Something went wrong. Try again.", "error");
            }
        },
        [ids, session?.user, toast]
    );

    const value: WishlistContextValue = {
        ids,
        isWishlisted: (id) => ids.has(id),
        toggle,
        count: ids.size,
    };

    return (
        <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
    );
}
