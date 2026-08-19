import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { requirePermission } from "@/lib/session";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { isStorefrontConfigured, isAdminConfigured } from "@/lib/shopify/types";
import { isPodConfigured, getPodProvider } from "@/lib/pod/provider";

export const metadata: Metadata = { title: "Admin · Settings", robots: { index: false } };

export default async function AdminSettingsPage() {
    await requirePermission("settings.manage", "/admin/settings");

    const integrations = [
        {
            name: "Shopify Storefront API",
            connected: isStorefrontConfigured(),
            env: "SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN",
            note: "Powers public products, collections, cart and checkout.",
        },
        {
            name: "Shopify Admin API",
            connected: isAdminConfigured(),
            env: "SHOPIFY_ADMIN_ACCESS_TOKEN",
            note: "Server-side only. Powers orders, fulfillment and commission attribution.",
        },
        {
            name: "Print-on-Demand",
            connected: isPodConfigured(),
            env: "POD_PROVIDER, POD_API_KEY, POD_API_URL",
            note: `Active provider: ${getPodProvider().name}. Enables printing & fulfillment.`,
        },
        {
            name: "Database",
            connected: true,
            env: "DATABASE_URL",
            note: "PostgreSQL via Prisma. Required for the app to run.",
        },
        {
            name: "Authentication",
            connected: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
            env: "AUTH_SECRET",
            note: "NextAuth session signing secret.",
        },
    ];

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Settings" subtitle="Integration status and configuration." />

            <div className="space-y-3">
                {integrations.map((it) => (
                    <div
                        key={it.name}
                        className="flex flex-col gap-3 rounded-2xl border border-grey-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            {it.connected ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                            ) : (
                                <XCircle className="mt-0.5 h-5 w-5 text-grey-300" />
                            )}
                            <div>
                                <p className="font-bold text-ink">{it.name}</p>
                                <p className="text-sm text-grey-500">{it.note}</p>
                                <p className="mt-1 font-mono text-[11px] text-grey-400">{it.env}</p>
                            </div>
                        </div>
                        <span
                            className={
                                "shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide " +
                                (it.connected ? "bg-success/10 text-success" : "bg-grey-100 text-grey-400")
                            }
                        >
                            {it.connected ? "Connected" : "Not connected"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-2xl border border-grey-200 bg-white p-6">
                <h2 className="mb-2 font-bold text-ink">Security</h2>
                <ul className="space-y-1.5 text-sm text-grey-600">
                    <li>• Secrets are read only from server-side environment variables.</li>
                    <li>• Admin & Storefront tokens are never exposed to the browser.</li>
                    <li>• Every admin API route verifies session + role + permission.</li>
                    <li>• Users cannot change their own role via any client request.</li>
                </ul>
            </div>
        </div>
    );
}
