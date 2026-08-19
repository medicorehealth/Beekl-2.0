import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format a number as INR currency. Accepts number or numeric string. */
export function formatINR(
    amount: number | string | null | undefined,
    options: { withDecimals?: boolean } = {}
): string {
    const value = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
    if (Number.isNaN(value)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: options.withDecimals ? 2 : 0,
        maximumFractionDigits: options.withDecimals ? 2 : 0,
    }).format(value);
}

/** Format money from a currency + amount pair (used with Shopify money). */
export function formatMoney(amount: string | number, currencyCode = "INR"): string {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(value)) return "—";
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        }).format(value);
    } catch {
        return `${currencyCode} ${value.toFixed(2)}`;
    }
}

/** Compute a discount percentage from original vs current price. */
export function discountPercent(
    original?: number | string | null,
    current?: number | string | null
): number | null {
    const o = typeof original === "string" ? parseFloat(original) : original ?? 0;
    const c = typeof current === "string" ? parseFloat(current) : current ?? 0;
    if (!o || !c || o <= c) return null;
    return Math.round(((o - c) / o) * 100);
}

/** Turn a string into a URL-safe slug. */
export function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

/** Format a date in a friendly Indian format. */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(d);
}

/** Format a date+time. */
export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

/** Basis points → human percentage string, e.g. 1500 -> "15%". */
export function bpsToPercent(bps: number): string {
    return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

/** Truncate text to a max length with an ellipsis. */
export function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + "…";
}

/** Debounce helper for client-side search etc. */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/** Extract the numeric id from a Shopify GID string. */
export function parseShopifyId(gid: string): string {
    const parts = gid.split("/");
    return parts[parts.length - 1] || gid;
}

/** Convert a plain id + resource to a Shopify GID. */
export function toShopifyGid(resource: string, id: string): string {
    if (id.startsWith("gid://")) return id;
    return `gid://shopify/${resource}/${id}`;
}

/** Get initials from a name for avatar fallbacks. */
export function initials(name?: string | null): string {
    if (!name) return "BK";
    return name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
