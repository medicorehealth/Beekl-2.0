import "server-only";
import {
    isStorefrontConfigured,
    type ShopifyCart,
    type ShopifyCollection,
    type ShopifyProduct,
} from "./types";

/**
 * Shopify Storefront API client.
 *
 * Used for PUBLIC storefront data (products, collections, cart, checkout URL).
 * The Storefront token is a public-scope token, but we still only call it from
 * the server to keep a single, cacheable, rate-limit-friendly surface.
 *
 * If the Storefront API is not configured, every function degrades gracefully
 * (returns empty results / null) so the app renders "not connected" states
 * instead of crashing. NOTHING here is faked.
 */

const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2024-07";

function endpoint(): string {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    return `https://${domain}/api/${API_VERSION}/graphql.json`;
}

export class ShopifyNotConfiguredError extends Error {
    constructor() {
        super("Shopify Storefront API is not configured.");
        this.name = "ShopifyNotConfiguredError";
    }
}

type GraphQLResponse<T> = {
    data?: T;
    errors?: { message: string }[];
};

/** Low-level Storefront GraphQL fetch. Throws if not configured. */
export async function storefrontFetch<T>(
    query: string,
    variables: Record<string, unknown> = {},
    cache: RequestCache = "no-store"
): Promise<T> {
    if (!isStorefrontConfigured()) {
        throw new ShopifyNotConfiguredError();
    }

    const res = await fetch(endpoint(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token":
                process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
        },
        body: JSON.stringify({ query, variables }),
        cache,
        next: { revalidate: cache === "force-cache" ? 60 : undefined },
    });

    if (!res.ok) {
        throw new Error(`Shopify Storefront error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    if (!json.data) throw new Error("Shopify Storefront returned no data.");
    return json.data;
}

// ---------------------------------------------------------------------------
// GraphQL fragments
// ---------------------------------------------------------------------------

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    tags
    vendor
    availableForSale
    featuredImage { url altText width height }
    images(first: 10) { nodes { url altText width height } }
    options { id name values }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { url altText width height }
      }
    }
  }
`;

type RawProduct = Omit<ShopifyProduct, "images" | "variants"> & {
    images: { nodes: ShopifyProduct["images"] };
    variants: { nodes: ShopifyProduct["variants"] };
};

function normalizeProduct(p: RawProduct | null): ShopifyProduct | null {
    if (!p) return null;
    return {
        ...p,
        images: p.images?.nodes ?? [],
        variants: p.variants?.nodes ?? [],
    };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function getProducts(options: {
    first?: number;
    query?: string;
    sortKey?: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
    reverse?: boolean;
} = {}): Promise<ShopifyProduct[]> {
    if (!isStorefrontConfigured()) return [];
    const { first = 24, query = "", sortKey = "BEST_SELLING", reverse = false } = options;

    const data = await storefrontFetch<{ products: { nodes: RawProduct[] } }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Products($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
          nodes { ...ProductFields }
        }
      }
    `,
        { first, query, sortKey, reverse }
    );

    return data.products.nodes
        .map(normalizeProduct)
        .filter((p): p is ShopifyProduct => Boolean(p));
}

export async function getProductByHandle(
    handle: string
): Promise<ShopifyProduct | null> {
    if (!isStorefrontConfigured()) return null;

    const data = await storefrontFetch<{ product: RawProduct | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Product($handle: String!) {
        product(handle: $handle) { ...ProductFields }
      }
    `,
        { handle }
    );

    return normalizeProduct(data.product);
}

export async function getProductRecommendations(
    productId: string
): Promise<ShopifyProduct[]> {
    if (!isStorefrontConfigured()) return [];

    const data = await storefrontFetch<{ productRecommendations: RawProduct[] }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Recommendations($productId: ID!) {
        productRecommendations(productId: $productId) { ...ProductFields }
      }
    `,
        { productId }
    );

    return (data.productRecommendations ?? [])
        .map(normalizeProduct)
        .filter((p): p is ShopifyProduct => Boolean(p));
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function getCollections(
    first = 20
): Promise<ShopifyCollection[]> {
    if (!isStorefrontConfigured()) return [];

    const data = await storefrontFetch<{
        collections: { nodes: ShopifyCollection[] };
    }>(
    /* GraphQL */ `
      query Collections($first: Int!) {
        collections(first: $first) {
          nodes { id handle title description image { url altText width height } }
        }
      }
    `,
        { first }
    );

    return data.collections.nodes;
}

export async function getCollectionProducts(
    handle: string,
    first = 24
): Promise<{ collection: ShopifyCollection | null; products: ShopifyProduct[] }> {
    if (!isStorefrontConfigured()) return { collection: null, products: [] };

    const data = await storefrontFetch<{
        collection:
        | (ShopifyCollection & { products: { nodes: RawProduct[] } })
        | null;
    }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query CollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          id handle title description
          image { url altText width height }
          products(first: $first) { nodes { ...ProductFields } }
        }
      }
    `,
        { handle, first }
    );

    if (!data.collection) return { collection: null, products: [] };
    const { products, ...collection } = data.collection;
    return {
        collection,
        products: products.nodes
            .map(normalizeProduct)
            .filter((p): p is ShopifyProduct => Boolean(p)),
    };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchProducts(
    term: string,
    first = 12
): Promise<ShopifyProduct[]> {
    if (!isStorefrontConfigured() || !term.trim()) return [];
    return getProducts({ first, query: term, sortKey: "RELEVANCE" });
}

// ---------------------------------------------------------------------------
// Cart (Shopify checkout is the source of truth)
// ---------------------------------------------------------------------------

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            selectedOptions { name value }
            product {
              handle
              title
              featuredImage { url altText width height }
            }
          }
        }
      }
    }
  }
`;

type RawCart = Omit<ShopifyCart, "lines"> & { lines: { nodes: ShopifyCart["lines"] } };

function normalizeCart(c: RawCart | null): ShopifyCart | null {
    if (!c) return null;
    return { ...c, lines: c.lines?.nodes ?? [] };
}

export async function createCart(): Promise<ShopifyCart | null> {
    if (!isStorefrontConfigured()) return null;
    const data = await storefrontFetch<{ cartCreate: { cart: RawCart } }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartCreate {
        cartCreate { cart { ...CartFields } }
      }
    `
    );
    return normalizeCart(data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
    if (!isStorefrontConfigured()) return null;
    const data = await storefrontFetch<{ cart: RawCart | null }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      query Cart($cartId: ID!) {
        cart(id: $cartId) { ...CartFields }
      }
    `,
        { cartId }
    );
    return normalizeCart(data.cart);
}

export async function addToCart(
    cartId: string,
    lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart | null> {
    if (!isStorefrontConfigured()) return null;
    const data = await storefrontFetch<{ cartLinesAdd: { cart: RawCart } }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
      }
    `,
        { cartId, lines }
    );
    return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(
    cartId: string,
    lineId: string,
    quantity: number
): Promise<ShopifyCart | null> {
    if (!isStorefrontConfigured()) return null;
    const data = await storefrontFetch<{ cartLinesUpdate: { cart: RawCart } }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
      }
    `,
        { cartId, lines: [{ id: lineId, quantity }] }
    );
    return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(
    cartId: string,
    lineId: string
): Promise<ShopifyCart | null> {
    if (!isStorefrontConfigured()) return null;
    const data = await storefrontFetch<{ cartLinesRemove: { cart: RawCart } }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } }
      }
    `,
        { cartId, lineIds: [lineId] }
    );
    return normalizeCart(data.cartLinesRemove.cart);
}
