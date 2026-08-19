import "server-only";
import { isAdminConfigured } from "./types";

/**
 * Shopify Admin API client — PRIVILEGED, SERVER-SIDE ONLY.
 *
 * ⚠️ The Admin access token must NEVER be exposed to the browser. This module
 * imports "server-only" so any accidental client import fails the build.
 *
 * Used for privileged operations: reading full orders for fulfillment, syncing
 * product metadata, etc. If the Admin API is not configured, callers receive
 * null / empty results and the UI shows a "not connected" state.
 */

const API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || "2024-07";

function endpoint(): string {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    return `https://${domain}/admin/api/${API_VERSION}/graphql.json`;
}

type GraphQLResponse<T> = {
    data?: T;
    errors?: { message: string }[];
};

/** Low-level Admin GraphQL fetch. Returns null if the Admin API is unconfigured. */
export async function adminFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
): Promise<T | null> {
    if (!isAdminConfigured()) return null;

    const res = await fetch(endpoint(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN as string,
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Shopify Admin error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    return json.data ?? null;
}

export type AdminOrderLine = {
    title: string;
    quantity: number;
    variantId: string | null;
    productId: string | null;
    sku: string | null;
    price: string;
};

export type AdminOrder = {
    id: string;
    name: string;
    email: string | null;
    displayFulfillmentStatus: string;
    displayFinancialStatus: string;
    totalPrice: string;
    currencyCode: string;
    processedAt: string;
    lineItems: AdminOrderLine[];
};

/** Fetch a full order by Shopify GID (server-side privileged read). */
export async function getAdminOrder(orderId: string): Promise<AdminOrder | null> {
    const data = await adminFetch<{
        order: {
            id: string;
            name: string;
            email: string | null;
            displayFulfillmentStatus: string;
            displayFinancialStatus: string;
            currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
            processedAt: string;
            lineItems: {
                nodes: {
                    title: string;
                    quantity: number;
                    sku: string | null;
                    originalUnitPriceSet: { shopMoney: { amount: string } };
                    variant: { id: string; product: { id: string } } | null;
                }[];
            };
        } | null;
    }>(
    /* GraphQL */ `
      query AdminOrder($id: ID!) {
        order(id: $id) {
          id
          name
          email
          displayFulfillmentStatus
          displayFinancialStatus
          processedAt
          currentTotalPriceSet { shopMoney { amount currencyCode } }
          lineItems(first: 100) {
            nodes {
              title
              quantity
              sku
              originalUnitPriceSet { shopMoney { amount } }
              variant { id product { id } }
            }
          }
        }
      }
    `,
        { id: orderId }
    );

    if (!data?.order) return null;
    const o = data.order;
    return {
        id: o.id,
        name: o.name,
        email: o.email,
        displayFulfillmentStatus: o.displayFulfillmentStatus,
        displayFinancialStatus: o.displayFinancialStatus,
        totalPrice: o.currentTotalPriceSet.shopMoney.amount,
        currencyCode: o.currentTotalPriceSet.shopMoney.currencyCode,
        processedAt: o.processedAt,
        lineItems: o.lineItems.nodes.map((l) => ({
            title: l.title,
            quantity: l.quantity,
            sku: l.sku,
            variantId: l.variant?.id ?? null,
            productId: l.variant?.product?.id ?? null,
            price: l.originalUnitPriceSet.shopMoney.amount,
        })),
    };
}
