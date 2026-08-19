import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopToolbar } from "@/components/commerce/ShopToolbar";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";
import { listProducts, listProductsByCollectionKind, applyFilters } from "@/lib/catalog";
import { getCollectionProducts } from "@/lib/shopify/storefront";
import { isStorefrontConfigured } from "@/lib/shopify/types";

type Props = { params: { slug: string }; searchParams: { [k: string]: string | undefined } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const collection = await safe(
        () => prisma.collectionRef.findUnique({ where: { slug: params.slug } }),
        null
    );
    if (!collection) {
        // Still allow known category slugs handled below.
        return { title: params.slug.replace(/-/g, " ") };
    }
    return {
        title: collection.title,
        description: collection.description ?? `${collection.title} on BeeKL.`,
        alternates: { canonical: `/collections/${collection.slug}` },
    };
}

export const revalidate = 60;

export default async function CollectionPage({ params, searchParams }: Props) {
    const collection = await safe(
        () => prisma.collectionRef.findUnique({ where: { slug: params.slug } }),
        null
    );

    // Resolve products: prefer Shopify collection, then by-kind demo, then tag.
    let products = await safe(async () => {
        if (isStorefrontConfigured() && collection?.shopifyCollectionId) {
            const { products } = await getCollectionProducts(params.slug, 48);
            // Map raw shopify products via listProducts tag fallback if empty.
            if (products.length) {
                return products.map((p) => ({
                    id: p.id,
                    handle: p.handle,
                    title: p.title,
                    image: p.featuredImage?.url ?? null,
                    hoverImage: p.images[1]?.url ?? null,
                    price: p.priceRange ? parseFloat(p.priceRange.minVariantPrice.amount) : null,
                    compareAtPrice: null,
                    currencyCode: p.priceRange?.minVariantPrice.currencyCode ?? "INR",
                    availableForSale: p.availableForSale,
                    tags: p.tags,
                    productReferenceId: null,
                    creator: null,
                    community: null,
                    shopifyVariantId: p.variants[0]?.id ?? null,
                    source: "shopify" as const,
                }));
            }
        }
        if (collection?.kind && collection.kind !== "GENERIC") {
            return listProductsByCollectionKind(collection.kind);
        }
        return listProducts({ first: 48, tag: params.slug });
    }, []);

    if (!collection && products.length === 0) {
        // Unknown collection with no products.
        notFound();
    }

    const filtered = applyFilters(products, searchParams);

    return (
        <div>
            {/* Hero */}
            <section className="relative flex min-h-[280px] items-end overflow-hidden bg-ink">
                {collection?.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={collection.heroImage}
                        alt={collection.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                <div className="bk-container relative z-10 py-10">
                    <h1 className="font-display text-display-sm text-paper">
                        {collection?.title ?? params.slug.replace(/-/g, " ")}
                    </h1>
                    {collection?.description && (
                        <p className="mt-2 max-w-xl text-paper/70">{collection.description}</p>
                    )}
                </div>
            </section>

            <div className="bk-container py-10">
                <ShopToolbar total={filtered.length} />
                <ProductGrid products={filtered} />
            </div>
        </div>
    );
}
