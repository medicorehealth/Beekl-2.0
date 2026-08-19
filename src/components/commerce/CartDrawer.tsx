"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { Drawer } from "@/components/ui/Drawer";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export function CartDrawer() {
    const { cart, open, setOpen, updateItem, removeItem, configured, count } = useCart();

    const lines = cart?.lines ?? [];

    return (
        <Drawer
            open={open}
            onClose={() => setOpen(false)}
            title={`Your Bag${count ? ` (${count})` : ""}`}
            footer={
                lines.length > 0 && cart ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-grey-500">Subtotal</span>
                            <span className="font-bold text-ink">
                                {formatMoney(
                                    cart.cost.subtotalAmount.amount,
                                    cart.cost.subtotalAmount.currencyCode
                                )}
                            </span>
                        </div>
                        <p className="text-xs text-grey-400">
                            Taxes and shipping calculated at checkout. {SITE.announcement}.
                        </p>
                        {/* Real Shopify checkout — never a fake payment page. */}
                        <ButtonLink href={cart.checkoutUrl} variant="primary" size="lg" fullWidth>
                            Checkout
                        </ButtonLink>
                    </div>
                ) : null
            }
        >
            {!configured ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <ShoppingBag className="mb-4 h-10 w-10 text-grey-300" />
                    <h3 className="text-base font-bold text-ink">Checkout isn&apos;t connected</h3>
                    <p className="mt-1 text-sm text-grey-500">
                        Shopify checkout is not configured yet. Connect Shopify to enable the
                        bag and secure checkout.
                    </p>
                </div>
            ) : lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <ShoppingBag className="mb-4 h-10 w-10 text-grey-300" />
                    <h3 className="text-base font-bold text-ink">Your bag is empty.</h3>
                    <p className="mt-1 text-sm text-grey-500">
                        The internet is waiting to get dressed.
                    </p>
                    <ButtonLink
                        href="/shop"
                        variant="outline"
                        size="sm"
                        className="mt-5"
                        onClick={() => setOpen(false)}
                    >
                        Start shopping
                    </ButtonLink>
                </div>
            ) : (
                <ul className="divide-y divide-grey-100">
                    {lines.map((line) => (
                        <li key={line.id} className="flex gap-4 p-5">
                            <Link
                                href={`/products/${line.merchandise.product.handle}`}
                                onClick={() => setOpen(false)}
                                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-grey-100"
                            >
                                {line.merchandise.product.featuredImage?.url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={line.merchandise.product.featuredImage.url}
                                        alt={line.merchandise.product.title}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </Link>
                            <div className="flex flex-1 flex-col">
                                <div className="flex justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-semibold text-ink line-clamp-1">
                                            {line.merchandise.product.title}
                                        </h4>
                                        <p className="text-xs text-grey-400">{line.merchandise.title}</p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(line.id)}
                                        aria-label="Remove"
                                        className="text-grey-400 transition-colors hover:text-flame"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center rounded-full border border-grey-200">
                                        <button
                                            onClick={() => updateItem(line.id, line.quantity - 1)}
                                            className="flex h-8 w-8 items-center justify-center text-grey-600 hover:text-ink"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold">
                                            {line.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateItem(line.id, line.quantity + 1)}
                                            className="flex h-8 w-8 items-center justify-center text-grey-600 hover:text-ink"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <span className="text-sm font-bold text-ink">
                                        {formatMoney(
                                            line.cost.totalAmount.amount,
                                            line.cost.totalAmount.currencyCode
                                        )}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Drawer>
    );
}
