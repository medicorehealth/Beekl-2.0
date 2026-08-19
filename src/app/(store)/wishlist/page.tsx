"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { WishlistButton } from "@/components/commerce/WishlistButton";

type WishItem = {
    productReferenceId: string;
    handle: string;
    title: string;
    creatorHandle: string | null;
};

export default function WishlistPage() {
    const { data: session, status } = useSession();
    const { ids } = useWishlist();
    const [items, setItems] = React.useState<WishItem[] | null>(null);

    React.useEffect(() => {
        if (status !== "authenticated") return;
        (async () => {
            try {
                const res = await fetch("/api/wishlist/products");
                const data = await res.json();
                setItems(data.items ?? []);
            } catch {
                setItems([]);
            }
        })();
        // Re-fetch when the wishlist set changes (add/remove).
    }, [status, ids.size]);

    if (status === "loading") {
        return (
            <div className="bk-container py-16">
                <LoadingState />
            </div>
        );
    }

    if (status !== "authenticated") {
        return (
            <div className="bk-container py-10">
                <h1 className="mb-8 font-display text-display-sm text-ink">Wishlist</h1>
                <EmptyState
                    icon={<Heart className="h-6 w-6" />}
                    title="Sign in to see your wishlist."
                    description="Save the fits you love and find them here, on any device."
                    action={{ label: "Sign in", href: "/login?callbackUrl=/wishlist" }}
                />
            </div>
        );
    }

    return (
        <div className="bk-container py-10">
            <h1 className="mb-8 font-display text-display-sm text-ink">Wishlist</h1>

            {items === null ? (
                <LoadingState />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<Heart className="h-6 w-6" />}
                    title="No saved items yet."
                    description="Tap the heart on any product to save it here."
                    action={{ label: "Start shopping", href: "/shop" }}
                />
            ) : (
                <ul className="divide-y divide-grey-100 rounded-2xl border border-grey-200 bg-white">
                    {items.map((item) => (
                        <li key={item.productReferenceId} className="flex items-center justify-between gap-4 p-5">
                            <Link
                                href={`/products/${item.handle}`}
                                className="font-semibold text-ink hover:text-flame"
                            >
                                {item.title}
                                {item.creatorHandle && (
                                    <span className="ml-2 text-xs font-normal text-grey-400">
                                        @{item.creatorHandle}
                                    </span>
                                )}
                            </Link>
                            <div className="flex items-center gap-3">
                                <ButtonLink href={`/products/${item.handle}`} size="sm" variant="outline">
                                    View
                                </ButtonLink>
                                <WishlistButton
                                    productReferenceId={item.productReferenceId}
                                    className="!shadow-none"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
