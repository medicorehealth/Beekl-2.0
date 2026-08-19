import "server-only";
import { prisma } from "@/lib/db";
import { isStorefrontConfigured, type ShopifyProduct } from "@/lib/shopify/types";
import { getProducts, getProductByHandle } from "@/lib/shopify/storefront";

/**
 * Unified catalog layer.
 *
 * A "BeeklProduct" is a storefront-ready view that merges:
 *   - commerce data (price, images, variants) from Shopify when configured, OR
 *     from the local ProductReference demo data when Shopify is not connected;
 *   - BeeKL editorial metadata (creator, community, story) from Prisma.
 *
 * This lets the UI render consistently whether or not Shopify is live. When
 * Shopify is NOT configured we clearly operate in "demo catalog" mode using
 * seeded ProductReference rows — these are explicitly development data.
 */

export type BeeklProduct = {
    id: string; // ProductReference id OR shopify handle-derived id
    handle: string;
    title: string;
    image: string | null;
    hoverImage: string | null;
    price: number | null;
    compareAtPrice: number | null;
    currencyCode: string;
    availableForSale: boolean;
    tags: string[];
    // Editorial
    productReferenceId?: string | null;
    creator?: { handle: string; displayName: string } | null;
    community?: { slug: string; name: string } | null;
    // Commerce linkage
    shopifyVariantId?: string | null;
    source: "shopify" | "demo";
};

const DEMO_IMAGES = [
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
];

function demoImageFor(seed: string, offset = 0): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return DEMO_IMAGES[(h + offset) % DEMO_IMAGES.length];
}

/** Deterministic demo price so the UI has something real to render (marked demo). */
function demoPrice(seed: string): { price: number; compareAt: number } {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 17 + seed.charCodeAt(i)) >>> 0;
    const base = 699 + (h % 12) * 100; // 699..1799
    const hasDiscount = h % 3 === 0;
    return {
        price: base,
        compareAt: hasDiscount ? base + 300 : 0,
    };
}

function fromShopify(
    p: ShopifyProduct,
    meta?: {
        productReferenceId?: string;
        creator?: { handle: string; displayName: string } | null;
        community?: { slug: string; name: string } | null;
    }
): BeeklProduct {
    const firstVariant = p.variants[0];
    return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        image: p.featuredImage?.url ?? p.images[0]?.url ?? null,
        hoverImage: p.images[1]?.url ?? null,
        price: p.priceRange?.minVariantPrice
            ? parseFloat(p.priceRange.minVariantPrice.amount)
            : null,
        compareAtPrice: firstVariant?.compareAtPrice
            ? parseFloat(firstVariant.compareAtPrice.amount)
            : null,
        currencyCode: p.priceRange?.minVariantPrice?.currencyCode ?? "INR",
        availableForSale: p.availableForSale,
        tags: p.tags ?? [],
        productReferenceId: meta?.productReferenceId ?? null,
        creator: meta?.creator ?? null,
        community: meta?.community ?? null,
        shopifyVariantId: firstVariant?.id ?? null,
        source: "shopify",
    };
}

type ProductRefWithRelations = Awaited<
    ReturnType<typeof getProductRefs>
>[number];

async function getProductRefs(where: Record<string, unknown> = {}, take = 24) {
    return prisma.productReference.findMany({
        where: { status: "ACTIVE", ...where },
        include: {
            creator: { select: { handle: true, displayName: true } },
            community: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
    });
}

function fromReference(ref: ProductRefWithRelations): BeeklProduct {
    const { price, compareAt } = demoPrice(ref.handle);
    return {
        id: ref.id,
        handle: ref.handle,
        title: ref.title,
        image: demoImageFor(ref.handle),
        hoverImage: demoImageFor(ref.handle, 1),
        price,
        compareAtPrice: compareAt || null,
        currencyCode: "INR",
        availableForSale: true,
        tags: ref.tags,
        productReferenceId: ref.id,
        creator: ref.creator
            ? { handle: ref.creator.handle, displayName: ref.creator.displayName }
            : null,
        community: ref.community
            ? { slug: ref.community.slug, name: ref.community.name }
            : null,
        shopifyVariantId: null,
        source: "demo",
    };
}

/** Whether we are running the local demo catalog (Shopify not connected). */
export function isDemoCatalog(): boolean {
    return !isStorefrontConfigured();
}

/** List products for grids. Merges Shopify metadata with references when possible. */
export async function listProducts(options: {
    first?: number;
    query?: string;
    sortKey?: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
    reverse?: boolean;
    tag?: string;
} = {}): Promise<BeeklProduct[]> {
    const { first = 24, query, sortKey, reverse, tag } = options;

    if (isStorefrontConfigured()) {
        const q = [query, tag ? `tag:${tag}` : ""].filter(Boolean).join(" ");
        const products = await getProducts({ first, query: q, sortKey, reverse });
        // Enrich with references by shopify product id.
        const ids = products.map((p) => p.id);
        const refs = await prisma.productReference.findMany({
            where: { shopifyProductId: { in: ids } },
            include: {
                creator: { select: { handle: true, displayName: true } },
                community: { select: { slug: true, name: true } },
            },
        });
        const byShopifyId = new Map(refs.map((r) => [r.shopifyProductId, r]));
        return products.map((p) => {
            const ref = byShopifyId.get(p.id);
            return fromShopify(p, {
                productReferenceId: ref?.id,
                creator: ref?.creator ?? null,
                community: ref?.community ?? null,
            });
        });
    }

    // Demo catalog
    const where: Record<string, unknown> = {};
    if (tag) where.tags = { has: tag };
    const refs = await getProductRefs(where, first);
    let items = refs.map(fromReference);
    if (query) {
        const q = query.toLowerCase();
        items = items.filter((i) => i.title.toLowerCase().includes(q));
    }
    return items;
}

/** Get a single product view by handle. */
export async function getProduct(
    handle: string
): Promise<{ product: BeeklProduct; shopify: ShopifyProduct | null; reference: ProductRefWithRelations | null } | null> {
    const reference = await prisma.productReference.findUnique({
        where: { handle },
        include: {
            creator: { select: { handle: true, displayName: true } },
            community: { select: { slug: true, name: true } },
        },
    });

    if (isStorefrontConfigured()) {
        const shopify = await getProductByHandle(handle);
        if (shopify) {
            return {
                product: fromShopify(shopify, {
                    productReferenceId: reference?.id,
                    creator: reference?.creator ?? null,
                    community: reference?.community ?? null,
                }),
                shopify,
                reference,
            };
        }
    }

    if (!reference) return null;
    return { product: fromReference(reference), shopify: null, reference };
}

/** Products for a specific creator (by handle). */
export async function listProductsByCreator(handle: string): Promise<BeeklProduct[]> {
    const refs = await prisma.productReference.findMany({
        where: { status: "ACTIVE", creator: { handle } },
        include: {
            creator: { select: { handle: true, displayName: true } },
            community: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return refs.map(fromReference);
}

/** Products for a specific community (by slug). */
export async function listProductsByCommunity(slug: string): Promise<BeeklProduct[]> {
    const refs = await prisma.productReference.findMany({
        where: { status: "ACTIVE", community: { slug } },
        include: {
            creator: { select: { handle: true, displayName: true } },
            community: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return refs.map(fromReference);
}

/** Products for a specific drop (by slug). */
export async function listProductsByDrop(slug: string): Promise<BeeklProduct[]> {
    const refs = await prisma.productReference.findMany({
        where: { status: "ACTIVE", drop: { slug } },
        include: {
            creator: { select: { handle: true, displayName: true } },
            community: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return refs.map(fromReference);
}

/** Products for a collection by kind (memes/anime/etc.). */
export async function listProductsByCollectionKind(
    kind: string
): Promise<BeeklProduct[]> {
    const refs = await prisma.productReference.findMany({
        where: {
            status: "ACTIVE",
            collection: { kind: kind as never },
        },
        include: {
            creator: { select: { handle: true, displayName: true } },
            community: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return refs.map(fromReference);
}

export type ShopFilters = {
    sort?: string;
    size?: string;
    price?: string; // "min-max"
    availability?: string; // "in-stock"
    tag?: string;
};

/**
 * Apply client-facing filters/sort to a product list. Runs after fetching so
 * it works consistently for both Shopify and demo catalogs.
 */
export function applyFilters(
    products: BeeklProduct[],
    filters: ShopFilters
): BeeklProduct[] {
    let items = [...products];

    if (filters.availability === "in-stock") {
        items = items.filter((p) => p.availableForSale);
    }

    if (filters.price) {
        const [min, max] = filters.price.split("-").map((n) => parseInt(n, 10));
        items = items.filter((p) => {
            if (p.price == null) return false;
            return p.price >= (min || 0) && p.price <= (max || Infinity);
        });
    }

    switch (filters.sort) {
        case "price-asc":
            items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
            break;
        case "price-desc":
            items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
            break;
        case "newest":
            // Fetch order is already newest-first for the demo catalog.
            break;
        default:
            break;
    }

    return items;
}

/** Map the UI sort value to a Shopify sortKey + reverse flag. */
export function sortToShopify(sort?: string): {
    sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
    reverse: boolean;
} {
    switch (sort) {
        case "newest":
            return { sortKey: "CREATED_AT", reverse: true };
        case "price-asc":
            return { sortKey: "PRICE", reverse: false };
        case "price-desc":
            return { sortKey: "PRICE", reverse: true };
        default:
            return { sortKey: "BEST_SELLING", reverse: false };
    }
}


