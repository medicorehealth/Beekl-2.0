import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { getCreatorCommissionSummary } from "@/lib/commissions";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Creator · Commissions", robots: { index: false } };

export default async function CreatorCommissionsPage() {
    const user = await getCurrentUser();
    const creator = await safe(
        () => prisma.creator.findUnique({ where: { userId: user!.id }, select: { id: true } }),
        null
    );

    const [summary, ledger, payouts] = await Promise.all([
        creator ? safe(() => getCreatorCommissionSummary(creator.id), null) : Promise.resolve(null),
        creator
            ? safe(
                () =>
                    prisma.commission.findMany({
                        where: { creatorId: creator.id },
                        orderBy: { createdAt: "desc" },
                        take: 50,
                        include: {
                            product: { select: { title: true } },
                            orderReference: { select: { orderNumber: true } },
                        },
                    }),
                []
            )
            : Promise.resolve([]),
        creator
            ? safe(
                () =>
                    prisma.payout.findMany({
                        where: { creatorId: creator.id },
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    }),
                []
            )
            : Promise.resolve([]),
    ]);

    return (
        <CreatorShell title="Commissions" subtitle="Your earnings ledger.">
            {summary && (
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatsCard label="Pending" value={formatINR(summary.PENDING.amount)} />
                    <StatsCard
                        label="Payable"
                        value={formatINR(summary.PAYABLE.amount + summary.APPROVED.amount)}
                        tone="accent"
                    />
                    <StatsCard label="Paid" value={formatINR(summary.PAID.amount)} tone="dark" />
                    <StatsCard label="Cancelled" value={formatINR(summary.CANCELLED.amount)} />
                </div>
            )}

            <h2 className="mb-3 text-lg font-bold text-ink">Ledger</h2>
            {ledger.length ? (
                <div className="mb-10 overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Gross</th>
                                <th className="px-5 py-3">Commission</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {ledger.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-5 py-3 text-grey-600">
                                        {c.orderReference.orderNumber ?? "—"}
                                    </td>
                                    <td className="px-5 py-3 text-grey-600">{c.product?.title ?? "—"}</td>
                                    <td className="px-5 py-3 text-grey-500">
                                        {formatINR(Number(c.grossAmount))}
                                    </td>
                                    <td className="px-5 py-3 font-bold text-ink">
                                        {formatINR(Number(c.commissionAmount))}
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">{formatDate(c.createdAt)}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState
                    title="No commissions yet."
                    description="When your products sell, commission entries appear here. Every calculation is done server-side."
                />
            )}

            <h2 className="mb-3 text-lg font-bold text-ink">Payouts</h2>
            {payouts.length ? (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {payouts.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-5 py-3 font-bold text-ink">
                                        {formatINR(Number(p.amount))}
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">
                                        {formatDate(p.paidAt ?? p.createdAt)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-grey-500">No payouts yet.</p>
            )}
        </CreatorShell>
    );
}
