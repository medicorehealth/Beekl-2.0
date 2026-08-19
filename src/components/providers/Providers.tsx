"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";

/** Root client providers. Order matters: Toast must wrap Cart/Wishlist. */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <WishlistProvider>
                    <CartProvider>{children}</CartProvider>
                </WishlistProvider>
            </ToastProvider>
        </SessionProvider>
    );
}
