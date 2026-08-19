"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Lock } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { ButtonLink, Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export default function CartPage() {
    const { cart, updateItem, removeItem, configured, count } = useCart();
    const lines = cart?.lines ?? [];

    return (
        <div className="bk-container py-10">
            <h1 className="mb-8 font-display text-display-sm text-ink">Your Bag</h1>

            {!configured ? (
                <div className="rounded-2xl border border-grey-200 bg-white p-10 text-center">
                    <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-grey-300" />
                    <h2 className="text-lg font-bold text-ink">Checkout isn&apos;t connected</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm text-grey-500">
                        Shopify checkout is not configured in this environment. Once
                        connected, your bag and secure checkout will work here.
                    </p>
                    <ButtonLink href="/shop" variant="outline" className="mt-6">
                        Continue shopping
                    </ButtonLink>
                </div>
            ) : lines.length === 0 ? (
                <div className="rounded-2xl border border-grey-200 bg-white p-10 text-center">
                    <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-grey-300" />
                    <h2 className="text-lg font-bold text-ink">Your bag is empty.</h2>
                    <p className="mt-1 text-sm text-grey-500">
                        The internet is waiting to get dressed.
                    </p>
                    <ButtonLink href="/shop" className="mt-6">
                        Start shopping
                    </ButtonLink>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Lines */}
                    <div className="lg:col-span-2">
                        <ul className="divide-y divide-grey-100 rounded-2xl border border-grey-200 bg-white">
                            {lines.map((line) => (
                                <li key={line.id} className="flex gap-4 p-5">
                                    <Link
                                        href={`/products/${line.merchandise.product.handle}`}
                                        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-grey-100"
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
                                                <Link
                                                    href={`/products/${line.merchandise.product.handle}`}
                                                    className="font-semibold text-ink hover:text-flame"
                                                >
                                                    {line.merchandise.product.title}
                                                </Link>
                                                <p className="text-sm text-grey-400">{line.merchandise.title}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(line.id)}
                                                aria-label="Remove"
                                                className="text-grey-400 hover:text-flame"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex items-center rounded-full border border-grey-200">
                                                <button
                                                    onClick={() => updateItem(line.id, line.quantity - 1)}
                                                    className="flex h-9 w-9 items-center justify-center text-grey-600 hover:text-ink"
                                                    aria-label="Decrease"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-semibold">
                                                    {line.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateItem(line.id, line.quantity + 1)}
                                                    className="flex h-9 w-9 items-center justify-center text-grey-600 hover:text-ink"
                                                    aria-label="Increase"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <span className="font-bold text-ink">
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
                    </div>

                    {/* Summary */}
                    <aside className="h-fit rounded-2xl border border-grey-200 bg-white p-6 lg:sticky lg:top-24">
                        <h2 className="mb-4 text-lg font-bold text-ink">Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-grey-500">Items</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                            {cart && (
                                <div className="flex justify-between">
                                    <span className="text-grey-500">Subtotal</span>
                                    <span className="font-semibold">
                                        {formatMoney(
                                            cart.cost.subtotalAmount.amount,
                                            cart.cost.subtotalAmount.currencyCode
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-xs text-grey-400">
                            Taxes & shipping at checkout. {SITE.announcement}.
                        </p>
                        {cart && (
                            <ButtonLink href={cart.checkoutUrl} size="lg" fullWidth className="mt-5">
                                <Lock className="h-4 w-4" /> Secure Checkout
                            </ButtonLink>
                        )}
                        <ButtonLink href="/shop" variant="ghost" size="sm" fullWidth className="mt-2">
                            Continue shopping
                        </ButtonLink>
                    </aside>
                </div>
            )}
        </div>
    );
}
