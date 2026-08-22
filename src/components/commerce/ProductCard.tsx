import Link from "next/link";
import type { BeeklProduct } from "@/lib/catalog";
import { formatINR, discountPercent, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "./WishlistButton";
import { QuickAddButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: BeeklProduct }) {
    const discount = discountPercent(product.compareAtPrice, product.price);

    return (
        <div className="group relative">
            <Link href={`/products/${product.handle}`} className="block">
                <div className="bk-glass relative aspect-[3/4] overflow-hidden rounded-3xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift">
                    {product.image ? (

                        <>
                            {/* Base image */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.title}
                                loading="lazy"
                                className={cn(
                                    "absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105",
                                    product.hoverImage && "group-hover:opacity-0"
                                )}
                            />

                            {/* Hover image */}
                            {product.hoverImage && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={product.hoverImage}
                                    alt=""
                                    aria-hidden
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-grey-400">
                            No image
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        {discount && <Badge tone="flame">-{discount}%</Badge>}
                        {!product.availableForSale && <Badge tone="ink">Sold Out</Badge>}
                        {product.source === "demo" && (
                            <Badge tone="paper" className="opacity-90">
                                Demo
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist */}
                    <div className="absolute right-3 top-3">
                        <WishlistButton productReferenceId={product.productReferenceId} />
                    </div>

                    {/* Quick add on hover (desktop) */}
                    {product.shopifyVariantId && (
                        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
                            <QuickAddButton variantId={product.shopifyVariantId} />
                        </div>
                    )}
                </div>
            </Link>

            <div className="mt-3.5 space-y-1">
                {product.creator && (
                    <Link
                        href={`/creators/${product.creator.handle}`}
                        className="text-[11px] font-bold uppercase tracking-[0.12em] text-grey-400 hover:text-flame"
                    >
                        @{product.creator.handle}
                    </Link>
                )}
                <Link href={`/products/${product.handle}`} className="block">
                    <h3 className="line-clamp-1 text-[13px] font-bold uppercase tracking-tight text-ink">
                        {product.title}
                    </h3>
                </Link>
                <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[15px] font-bold text-ink">

                        {product.price != null ? formatINR(product.price) : "—"}
                    </span>
                    {product.compareAtPrice && discount && (
                        <span className="text-xs text-grey-400 line-through">
                            {formatINR(product.compareAtPrice)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
