"use client";

import * as React from "react";
import { Minus, Plus, Truck, RotateCcw, ShieldCheck, Ruler } from "lucide-react";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";
import type { BeeklProduct } from "@/lib/catalog";
import { useCart } from "@/components/providers/CartProvider";
import { WishlistButton } from "./WishlistButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatINR, formatMoney, discountPercent, cn } from "@/lib/utils";
import { SIZES } from "@/lib/constants";

/**
 * Interactive product buy-box. When Shopify variants exist we use them for
 * real add-to-cart + checkout. When running the demo catalog (no Shopify) we
 * still show the UI but clearly disable the non-functional buy button.
 */
export function ProductDetail({
    product,
    shopify,
}: {
    product: BeeklProduct;
    shopify: ShopifyProduct | null;
}) {
    const { addItem, setOpen, loading, configured } = useCart();
    const [qty, setQty] = React.useState(1);
    const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);

    // Determine option-based variant selection (Shopify) or a simple size pick.
    const sizeOption = shopify?.options.find((o) =>
        /size/i.test(o.name)
    );
    const [selectedSize, setSelectedSize] = React.useState<string | null>(
        sizeOption?.values[0] ?? null
    );

    const selectedVariant: ShopifyVariant | null = React.useMemo(() => {
        if (!shopify) return null;
        if (!sizeOption) return shopify.variants[0] ?? null;
        return (
            shopify.variants.find((v) =>
                v.selectedOptions.some(
                    (o) => /size/i.test(o.name) && o.value === selectedSize
                )
            ) ?? null
        );
    }, [shopify, sizeOption, selectedSize]);

    const price = selectedVariant
        ? parseFloat(selectedVariant.price.amount)
        : product.price;
    const compareAt = selectedVariant?.compareAtPrice
        ? parseFloat(selectedVariant.compareAtPrice.amount)
        : product.compareAtPrice;
    const discount = discountPercent(compareAt, price);

    const availableSizes = sizeOption?.values ?? (product.source === "demo" ? [...SIZES] : []);
    const outOfStock = selectedVariant ? !selectedVariant.availableForSale : false;

    async function handleAdd() {
        if (selectedVariant?.id) {
            await addItem(selectedVariant.id, qty);
        }
    }

    return (
        <div className="space-y-6">
            {/* Creator / community line */}
            {(product.creator || product.community) && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {product.community && (
                        <span className="font-semibold text-grey-600">
                            From the community of{" "}
                            <span className="text-ink">{product.community.name}</span>
                        </span>
                    )}
                    {product.creator && (
                        <Badge tone="paper">@{product.creator.handle}</Badge>
                    )}
                </div>
            )}

            <div>
                <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
                    {product.title}
                </h1>
                <div className="mt-3 flex items-center gap-3">
                    <span className="text-2xl font-bold text-ink">
                        {price != null
                            ? selectedVariant
                                ? formatMoney(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                                : formatINR(price)
                            : "—"}
                    </span>
                    {compareAt && discount && (
                        <>
                            <span className="text-lg text-grey-400 line-through">
                                {formatINR(compareAt)}
                            </span>
                            <Badge tone="flame">-{discount}%</Badge>
                        </>
                    )}
                </div>
                <p className="mt-1 text-xs text-grey-400">
                    MRP incl. of all taxes.
                </p>
            </div>

            {/* Size selector */}
            {availableSizes.length > 0 && (
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-grey-600">
                            Size
                        </span>
                        <button
                            onClick={() => setSizeGuideOpen(true)}
                            className="flex items-center gap-1 text-xs font-semibold text-ink hover:text-flame"
                        >
                            <Ruler className="h-3.5 w-3.5" /> Size guide
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSelectedSize(s)}
                                className={cn(
                                    "flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors",
                                    selectedSize === s
                                        ? "border-ink bg-ink text-paper"
                                        : "border-grey-200 text-ink hover:border-ink"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-grey-600">
                    Quantity
                </span>
                <div className="flex w-fit items-center rounded-xl border border-grey-200">
                    <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="flex h-11 w-11 items-center justify-center text-grey-600 hover:text-ink"
                        aria-label="Decrease"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold">{qty}</span>
                    <button
                        onClick={() => setQty((q) => Math.min(10, q + 1))}
                        className="flex h-11 w-11 items-center justify-center text-grey-600 hover:text-ink"
                        aria-label="Increase"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                {!configured || !selectedVariant ? (
                    <>
                        <Button variant="secondary" size="lg" fullWidth disabled>
                            {configured ? "Unavailable" : "Checkout not connected"}
                        </Button>
                        {!configured && (
                            <p className="text-center text-xs text-grey-400">
                                Shopify checkout isn&apos;t configured in this environment.
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={outOfStock || loading}
                            onClick={handleAdd}
                        >
                            {outOfStock ? "Sold Out" : loading ? "Adding…" : "Add to Cart"}
                        </Button>
                        <Button
                            variant="accent"
                            size="lg"
                            fullWidth
                            disabled={outOfStock || loading}
                            onClick={async () => {
                                await handleAdd();
                                setOpen(true);
                            }}
                        >
                            Buy Now
                        </Button>
                    </>
                )}
                <div className="flex justify-center">
                    <WishlistButton
                        productReferenceId={product.productReferenceId}
                        size="md"
                        className="!bg-transparent !shadow-none"
                    />
                </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 border-y border-grey-100 py-4 text-center">
                <Trust icon={<Truck className="h-4 w-4" />} label="Free ship ₹999+" />
                <Trust icon={<RotateCcw className="h-4 w-4" />} label="7-day returns" />
                <Trust icon={<ShieldCheck className="h-4 w-4" />} label="Secure checkout" />
            </div>

            <Modal
                open={sizeGuideOpen}
                onClose={() => setSizeGuideOpen(false)}
                title="Size Guide"
                description="Measurements in inches. Oversized fits run 1–2 sizes larger."
            >
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-grey-200 text-left text-xs uppercase text-grey-500">
                            <th className="py-2">Size</th>
                            <th className="py-2">Chest</th>
                            <th className="py-2">Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["XS", "36", "26"],
                            ["S", "38", "27"],
                            ["M", "40", "28"],
                            ["L", "42", "29"],
                            ["XL", "44", "30"],
                            ["XXL", "46", "31"],
                        ].map((r) => (
                            <tr key={r[0]} className="border-b border-grey-100">
                                <td className="py-2 font-bold">{r[0]}</td>
                                <td className="py-2">{r[1]}"</td>
                                <td className="py-2">{r[2]}"</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal>
        </div>
    );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1 text-grey-600">
            {icon}
            <span className="text-[11px] font-semibold">{label}</span>
        </div>
    );
}
