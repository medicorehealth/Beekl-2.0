import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState, DataUnavailable } from "@/components/ui/States";
import { isAdminConfigured } from "@/lib/shopify/types";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Orders", robots: { index: false } };

export default async function AdminOrdersPage() {
    await requirePermission("orders.view", "/admin/orders");

    const orders = await safe(
        () => prisma.orderReference.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Orders" subtitle="Order references synced from Shopify." />

            {!isAdminConfigured() && (
                <div className="mb-6">
                    <DataUnavailable note="Orders sync from the Shopify Admin API. Configure SHOPIFY_ADMIN_ACCESS_TOKEN to pull live orders." />
                </div>
            )}

            {orders.length === 0 ? (
                <EmptyState title="No orders yet." description="Orders appear here once customers check out via Shopify." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Fulfillment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-paper-soft/50">
                                    <td className="px-5 py-3 font-semibold text-ink">{o.orderNumber ?? o.id.slice(0, 8)}</td>
                                    <td className="px-5 py-3 text-grey-500">{o.email ?? "—"}</td>
                                    <td className="px-5 py-3 font-bold text-ink">{formatINR(Number(o.totalAmount))}</td>
                                    <td className="px-5 py-3 text-grey-500">{formatDate(o.processedAt ?? o.createdAt)}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(o.fulfillmentStatus)}>{o.fulfillmentStatus}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
