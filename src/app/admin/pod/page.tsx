import type { Metadata } from "next";
import { Printer } from "lucide-react";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { isPodConfigured, getPodProvider } from "@/lib/pod/provider";

export const metadata: Metadata = { title: "Admin · POD Orders", robots: { index: false } };

export default async function AdminPodPage() {
    await requirePermission("fulfillment.view", "/admin/pod");

    const podOrders = await safe(
        () =>
            prisma.podOrder.findMany({
                orderBy: { createdAt: "desc" },
                take: 100,
                include: { orderReference: { select: { orderNumber: true } } },
            }),
        []
    );

    const connected = isPodConfigured();
    const provider = getPodProvider();

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="POD Orders" subtitle="Print-on-demand fulfillment pipeline." />

            {/* Provider status */}
            <div
                className={
                    "mb-6 flex items-center gap-3 rounded-2xl border p-4 " +
                    (connected
                        ? "border-success/30 bg-success/10"
                        : "border-grey-200 bg-white")
                }
            >
                <Printer className={connected ? "h-5 w-5 text-success" : "h-5 w-5 text-grey-400"} />
                <div>
                    <p className="font-bold text-ink">
                        {connected ? `Connected: ${provider.name}` : "POD provider not connected."}
                    </p>
                    <p className="text-sm text-grey-500">
                        {connected
                            ? "Orders can be submitted to your print partner."
                            : "Set POD_PROVIDER and POD_API_KEY to enable print-on-demand fulfillment. The pipeline UI works, but no orders are sent until connected."}
                    </p>
                </div>
            </div>

            {podOrders.length === 0 ? (
                <EmptyState
                    title="No POD orders yet."
                    description="When orders route through the POD pipeline, they'll appear here with status and tracking."
                />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Provider</th>
                                <th className="px-5 py-3">Tracking</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {podOrders.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-5 py-3 font-semibold text-ink">
                                        {p.orderReference.orderNumber ?? "—"}
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">{p.provider ?? "—"}</td>
                                    <td className="px-5 py-3 text-grey-500">{p.trackingNumber ?? "—"}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(p.status)}>{p.status.replace(/_/g, " ")}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 rounded-2xl border border-grey-200 bg-white p-5 text-sm text-grey-500">
                <p className="font-bold text-ink">POD flow</p>
                <p className="mt-1">
                    Order → Shopify → BeeKL order processing → identify creator/community →
                    commission ledger → POD provider → printing → shipping → tracking →
                    customer. BeeKL uses a provider abstraction so a real POD partner can be
                    added without rewriting the app.
                </p>
            </div>
        </div>
    );
}
