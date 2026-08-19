import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductDetail } from "@/components/commerce/ProductDetail";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getProduct, listProducts } from "@/lib/catalog";
import { safe } from "@/lib/safe";
import { SITE } from "@/lib/constants";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await safe(() => getProduct(params.slug), null);
    if (!data) return { title: "Product not found" };
    const { product } = data;
    const image = product.image ?? undefined;
    return {
        title: product.title,
        description:
            product.creator
                ? `${product.title} — community merch from @${product.creator.handle} on BeeKL.`
                : `${product.title} on BeeKL. ${SITE.description}`,
        openGraph: {
            title: product.title,
            images: image ? [{ url: image }] : undefined,
            type: "website",
        },
        alternates: { canonical: `/products/${product.handle}` },
    };
}

export default async function ProductPage({ params }: Props) {
    const data = await safe(() => getProduct(params.slug), null);
    if (!data) notFound();

    const { product, shopify, reference } = data;

    const images =
        shopify?.images?.length
            ? shopify.images.map((i) => i.url)
            : [product.image, product.hoverImage].filter(Boolean) as string[];

    const recommendations = await safe(
        () => listProducts({ first: 8, tag: product.tags[0] }),
        []
    );
    const alsoLike = recommendations.filter((p) => p.handle !== product.handle).slice(0, 4);

    // Product structured data (SEO)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        image: images,
        description: reference?.story ?? SITE.description,
        brand: { "@type": "Brand", name: SITE.name },
        offers: {
            "@type": "Offer",
            priceCurrency: product.currencyCode,
            price: product.price ?? 0,
            availability: product.availableForSale
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        },
    };

    return (
        <div className="bk-container py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumb */}
            <nav className="mb-6 text-xs text-grey-400">
                <Link href="/" className="hover:text-ink">Home</Link>
                <span className="mx-1.5">/</span>
                <Link href="/shop" className="hover:text-ink">Shop</Link>
                <span className="mx-1.5">/</span>
                <span className="text-ink">{product.title}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <ProductGallery images={images} title={product.title} demo={product.source === "demo"} />
                <div>
                    <ProductDetail product={product} shopify={shopify} />
                </div>
            </div>

            {/* Editorial sections */}
            <div className="mt-14 grid gap-8 border-t border-grey-200 pt-10 md:grid-cols-2">
                <EditorialBlock
                    title="Product Story"
                    body={
                        reference?.story ??
                        "Every BeeKL piece starts as an idea from the community. This one made it from a group chat to your wardrobe."
                    }
                />
                <EditorialBlock
                    title="Why This Exists"
                    body={
                        reference?.whyThisExists ??
                        "Because the internet deserves better merch. We turn culture into clothing — responsibly, and only with original or licensed art."
                    }
                />
                {product.creator && (
                    <EditorialBlock
                        title="Designed By"
                        body={`Created within the BeeKL creator ecosystem by @${product.creator.handle}. When you buy this, the creator earns a commission.`}
                        action={{ label: "View creator", href: `/creators/${product.creator.handle}` }}
                    />
                )}
                <EditorialBlock
                    title="Delivery & Returns"
                    body="Free shipping on orders above ₹999. Dispatched in 2–4 business days. Easy 7-day returns on unworn items with tags. Tracking is shared once your order ships."
                />
            </div>

            {/* Recommendations */}
            {alsoLike.length > 0 && (
                <div className="mt-16">
                    <SectionHeader kicker="More like this" title="You May Also Like" />
                    <ProductGrid products={alsoLike} />
                </div>
            )}
        </div>
    );
}

function EditorialBlock({
    title,
    body,
    action,
}: {
    title: string;
    body: string;
    action?: { label: string; href: string };
}) {
    return (
        <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-grey-500">
                {title}
            </h2>
            <p className="bk-prose text-sm">{body}</p>
            {action && (
                <Link
                    href={action.href}
                    className="mt-2 inline-block text-sm font-bold text-ink hover:text-flame"
                >
                    {action.label} →
                </Link>
            )}
        </div>
    );
}
