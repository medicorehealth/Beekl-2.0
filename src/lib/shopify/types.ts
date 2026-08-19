/** Shared Shopify types (client-safe — no secrets here). */

export type ShopifyMoney = {
    amount: string;
    currencyCode: string;
};

export type ShopifyImage = {
    url: string;
    altText: string | null;
    width?: number;
    height?: number;
};

export type ShopifyVariant = {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable?: number | null;
    price: ShopifyMoney;
    compareAtPrice: ShopifyMoney | null;
    selectedOptions: { name: string; value: string }[];
    image?: ShopifyImage | null;
};

export type ShopifyProduct = {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    featuredImage: ShopifyImage | null;
    images: ShopifyImage[];
    priceRange: {
        minVariantPrice: ShopifyMoney;
        maxVariantPrice: ShopifyMoney;
    };
    compareAtPriceRange?: {
        minVariantPrice: ShopifyMoney;
        maxVariantPrice: ShopifyMoney;
    };
    variants: ShopifyVariant[];
    options: { id: string; name: string; values: string[] }[];
    tags: string[];
    availableForSale: boolean;
    vendor?: string;
};

export type ShopifyCollection = {
    id: string;
    handle: string;
    title: string;
    description: string;
    image: ShopifyImage | null;
};

export type ShopifyCartLine = {
    id: string;
    quantity: number;
    cost: { totalAmount: ShopifyMoney };
    merchandise: {
        id: string;
        title: string;
        product: {
            handle: string;
            title: string;
            featuredImage: ShopifyImage | null;
        };
        selectedOptions: { name: string; value: string }[];
        price: ShopifyMoney;
    };
};

export type ShopifyCart = {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    cost: {
        subtotalAmount: ShopifyMoney;
        totalAmount: ShopifyMoney;
        totalTaxAmount: ShopifyMoney | null;
    };
    lines: ShopifyCartLine[];
};

/** Whether the Shopify Storefront API is configured. */
export function isStorefrontConfigured(): boolean {
    return Boolean(
        process.env.SHOPIFY_STORE_DOMAIN &&
        process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    );
}

/** Whether the Shopify Admin API is configured. */
export function isAdminConfigured(): boolean {
    return Boolean(
        process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
    );
}
