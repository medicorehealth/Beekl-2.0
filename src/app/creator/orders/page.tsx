import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { EmptyState, DataUnavailable } from "@/components/ui/States";
import { Badge, statusTone } from "@/components/ui/Badge";
import { isAdminConfigured } from "@/lib/shopify/types";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Creator · Orders", robots: { index: false } };

export default async function CreatorOrdersPage() {
    const user = await getCurrentUser();

    // Orders attributed to this creator come from commissions (which are built
    // from real Shopify orders). We surface the distinct orders here.
    const commissions = await safe(
        () =>
            prisma.commission.findMany({
                where: { creator: { userId: user!.id } },
                orderBy: { createdAt: "desc" },
                take: 50,
                include: {
                    orderReference: { select: { orderNumber: true, processedAt: true, fulfillmentStatus: true } },
                    product: { select: { title: true } },
                },
            }),
        []
    );

    return (
        <CreatorShell title="Orders" subtitle="Orders that include your products.">
            {!isAdminConfigured() && (
                <div className="mb-6">
                    <DataUnavailable note="Orders are attributed from Shopify. Connect the Shopify Admin API to see real orders here." />
                </div>
            )}

            {commissions.length ? (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Your commission</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {commissions.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-5 py-3 font-semibold text-ink">
                                        {c.orderReference.orderNumber ?? "—"}
                                    </td>
                                    <td className="px-5 py-3 text-grey-600">{c.product?.title ?? "—"}</td>
                                    <td className="px-5 py-3 font-bold text-ink">
                                        {formatINR(Number(c.commissionAmount))}
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">
                                        {formatDate(c.orderReference.processedAt ?? c.createdAt)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(c.orderReference.fulfillmentStatus)}>
                                            {c.orderReference.fulfillmentStatus}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState
                    title="No orders yet."
                    description="When someone buys your merch, the order will appear here."
                />
            )}
        </CreatorShell>
    );
}
