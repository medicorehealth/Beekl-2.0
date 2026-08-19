import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButtons";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Commissions", robots: { index: false } };

export default async function AdminCommissionsPage() {
    const user = await requirePermission("commissions.view", "/admin/commissions");
    const canManage = user.permissions.includes("commissions.manage");

    const [grouped, ledger] = await Promise.all([
        safe(
            () =>
                prisma.commission.groupBy({
                    by: ["status"],
                    _sum: { commissionAmount: true },
                    _count: { _all: true },
                }),
            []
        ),
        safe(
            () =>
                prisma.commission.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 100,
                    include: {
                        creator: { select: { displayName: true } },
                        product: { select: { title: true } },
                        orderReference: { select: { orderNumber: true } },
                    },
                }),
            []
        ),
    ]);

    const totals: Record<string, number> = {};
    for (const g of grouped) totals[g.status] = Number(g._sum.commissionAmount ?? 0);

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Commissions" subtitle="The creator commission ledger. All amounts computed server-side." />

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
                <StatsCard label="Pending" value={formatINR(totals.PENDING ?? 0)} />
                <StatsCard label="Approved" value={formatINR(totals.APPROVED ?? 0)} />
                <StatsCard label="Payable" value={formatINR(totals.PAYABLE ?? 0)} tone="accent" />
                <StatsCard label="Paid" value={formatINR(totals.PAID ?? 0)} tone="dark" />
                <StatsCard label="Cancelled" value={formatINR(totals.CANCELLED ?? 0)} />
            </div>

            {ledger.length === 0 ? (
                <EmptyState
                    title="No commissions yet."
                    description="Commissions are generated from Shopify orders that include creator products."
                />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Creator</th>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Commission</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                                {canManage && <th className="px-5 py-3">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {ledger.map((c) => (
                                <tr key={c.id} className="hover:bg-paper-soft/50">
                                    <td className="px-5 py-3 font-semibold text-ink">{c.creator.displayName}</td>
                                    <td className="px-5 py-3 text-grey-500">{c.product?.title ?? "—"}</td>
                                    <td className="px-5 py-3 font-bold text-ink">{formatINR(Number(c.commissionAmount))}</td>
                                    <td className="px-5 py-3 text-grey-500">{formatDate(c.createdAt)}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                    </td>
                                    {canManage && (
                                        <td className="px-5 py-3">
                                            <div className="flex gap-2">
                                                {c.status === "PENDING" && (
                                                    <ActionButton endpoint="/api/admin/commissions" body={{ commissionId: c.id, action: "approve" }} label="Approve" size="sm" successMessage="Approved." />
                                                )}
                                                {c.status === "APPROVED" && (
                                                    <ActionButton endpoint="/api/admin/commissions" body={{ commissionId: c.id, action: "mark_payable" }} label="Mark payable" size="sm" successMessage="Marked payable." />
                                                )}
                                                {["PENDING", "APPROVED"].includes(c.status) && (
                                                    <ActionButton endpoint="/api/admin/commissions" body={{ commissionId: c.id, action: "cancel" }} label="Cancel" variant="ghost" size="sm" confirm="Cancel this commission?" successMessage="Cancelled." />
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
