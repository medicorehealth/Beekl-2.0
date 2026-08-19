import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { EmptyState } from "@/components/ui/States";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Returns", robots: { index: false } };

export default async function AdminReturnsPage() {
    await requirePermission("returns.manage", "/admin/returns");

    const returned = await safe(
        () =>
            prisma.orderReference.findMany({
                where: { fulfillmentStatus: "RETURNED" },
                orderBy: { updatedAt: "desc" },
                take: 50,
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Returns" subtitle="Returned and refunded orders." />

            {returned.length === 0 ? (
                <EmptyState
                    title="No returns."
                    description="Returned orders appear here. Refunds are processed via Shopify."
                />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {returned.map((o) => (
                                <tr key={o.id}>
                                    <td className="px-5 py-3 font-semibold text-ink">{o.orderNumber ?? o.id.slice(0, 8)}</td>
                                    <td className="px-5 py-3">{formatINR(Number(o.totalAmount))}</td>
                                    <td className="px-5 py-3 text-grey-500">{formatDate(o.updatedAt)}</td>
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
