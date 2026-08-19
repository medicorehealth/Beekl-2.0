import type { Metadata } from "next";
import { Truck } from "lucide-react";
import { requirePermission } from "@/lib/session";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { isAdminConfigured } from "@/lib/shopify/types";

export const metadata: Metadata = { title: "Admin · Shipping", robots: { index: false } };

export default async function AdminShippingPage() {
    await requirePermission("fulfillment.view", "/admin/shipping");
    const connected = isAdminConfigured();

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Shipping" subtitle="Shipping runs through Shopify's fulfillment ecosystem." />

            <div className="rounded-2xl border border-grey-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-ink">
                            {connected ? "Shopify shipping connected" : "Shopify not connected"}
                        </p>
                        <p className="text-sm text-grey-500">
                            {connected
                                ? "Shipping methods, rates, fulfillment and tracking are managed in Shopify."
                                : "Connect the Shopify Admin API to manage fulfillment and tracking."}
                        </p>
                    </div>
                </div>
                <ul className="space-y-2 text-sm text-grey-600">
                    <li>• Customers see shipping method & estimated delivery at checkout.</li>
                    <li>• Tracking numbers sync back from Shopify once fulfilled.</li>
                    <li>• Order status is reflected in each customer&apos;s account.</li>
                    <li>• {`Free shipping on orders above ₹999.`}</li>
                </ul>
            </div>
        </div>
    );
}
