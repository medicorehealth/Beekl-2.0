import "server-only";

/**
 * Print-on-Demand (POD) provider abstraction.
 *
 * BeeKL is designed so a real POD provider (Printful, Qikink, etc.) can be
 * plugged in later WITHOUT rewriting the application. Every provider must
 * implement the `PodProvider` interface below.
 *
 * If no provider is configured (POD_PROVIDER / POD_API_KEY unset), we return a
 * `NullPodProvider` whose methods report `configured: false`. The UI then shows
 * "POD provider not connected." — we NEVER fake a POD API call.
 */

export type PodAddress = {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
    country: string;
    phone?: string;
};

export type PodLineItem = {
    sku: string;
    quantity: number;
    // Optional print file / variant references understood by the provider.
    variantId?: string;
    printFileUrl?: string;
};

export type PodOrderRequest = {
    externalId: string; // BeeKL OrderReference id
    address: PodAddress;
    items: PodLineItem[];
};

export type PodResult<T> =
    | { configured: false; ok: false; message: string }
    | { configured: true; ok: true; data: T }
    | { configured: true; ok: false; message: string };

export type PodSubmitResult = {
    providerOrderId: string;
    status: string;
};

export type PodTracking = {
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
};

export interface PodProvider {
    readonly name: string;
    readonly configured: boolean;
    submitOrder(req: PodOrderRequest): Promise<PodResult<PodSubmitResult>>;
    getOrderStatus(providerOrderId: string): Promise<PodResult<PodTracking>>;
}

const NOT_CONNECTED_MESSAGE = "POD provider not connected.";

/** Fallback provider used when nothing is configured. Never fakes calls. */
class NullPodProvider implements PodProvider {
    readonly name = "none";
    readonly configured = false;

    async submitOrder(): Promise<PodResult<PodSubmitResult>> {
        return { configured: false, ok: false, message: NOT_CONNECTED_MESSAGE };
    }

    async getOrderStatus(): Promise<PodResult<PodTracking>> {
        return { configured: false, ok: false, message: NOT_CONNECTED_MESSAGE };
    }
}

/**
 * Example scaffold for a real provider. Intentionally NOT wired to a live API;
 * it demonstrates where real HTTP calls would go. Because BeeKL must not fake
 * POD calls, this scaffold throws if selected but incompletely implemented,
 * making the missing integration obvious rather than silently faking success.
 */
class GenericHttpPodProvider implements PodProvider {
    readonly name: string;
    readonly configured: boolean;
    private apiKey: string;
    private apiUrl: string;

    constructor(name: string, apiKey: string, apiUrl: string) {
        this.name = name;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.configured = Boolean(apiKey && apiUrl);
    }

    async submitOrder(req: PodOrderRequest): Promise<PodResult<PodSubmitResult>> {
        if (!this.configured) {
            return { configured: false, ok: false, message: NOT_CONNECTED_MESSAGE };
        }
        // A real integration would POST to the provider here. We surface a clear
        // "integration incomplete" error instead of fabricating a success response.
        return {
            configured: true,
            ok: false,
            message: `POD provider "${this.name}" is configured but the order submission integration is not implemented yet.`,
        };
    }

    async getOrderStatus(): Promise<PodResult<PodTracking>> {
        if (!this.configured) {
            return { configured: false, ok: false, message: NOT_CONNECTED_MESSAGE };
        }
        return {
            configured: true,
            ok: false,
            message: `POD provider "${this.name}" status polling is not implemented yet.`,
        };
    }
}

let cached: PodProvider | null = null;

/** Resolve the active POD provider from environment configuration. */
export function getPodProvider(): PodProvider {
    if (cached) return cached;

    const providerName = process.env.POD_PROVIDER?.trim();
    const apiKey = process.env.POD_API_KEY?.trim();
    const apiUrl = process.env.POD_API_URL?.trim();

    if (!providerName || !apiKey) {
        cached = new NullPodProvider();
        return cached;
    }

    cached = new GenericHttpPodProvider(providerName, apiKey, apiUrl || "");
    return cached;
}

/** Is any POD provider configured? */
export function isPodConfigured(): boolean {
    return getPodProvider().configured;
}
