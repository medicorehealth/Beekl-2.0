import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButtons";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Payouts", robots: { index: false } };

export default async function AdminPayoutsPage() {
    const user = await requirePermission("payouts.view", "/admin/payouts");
    const canManage = user.permissions.includes("payouts.manage");

    // Creators with payable commissions (ready to be paid out).
    const [payableByCreator, payouts] = await Promise.all([
        safe(
            () =>
                prisma.commission.groupBy({
                    by: ["creatorId"],
                    where: { status: { in: ["APPROVED", "PAYABLE"] }, payoutId: null },
                    _sum: { commissionAmount: true },
                    _count: { _all: true },
                }),
            []
        ),
        safe(
            () =>
                prisma.payout.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 50,
                    include: { creator: { select: { displayName: true } } },
                }),
            []
        ),
    ]);

    const creatorIds = payableByCreator.map((p) => p.creatorId);
    const creators = await safe(
        () =>
            prisma.creator.findMany({
                where: { id: { in: creatorIds } },
                select: { id: true, displayName: true },
            }),
        []
    );
    const nameById = new Map(creators.map((c) => [c.id, c.displayName]));

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Payouts" subtitle="Batch payable commissions and record payouts." />

            <h2 className="mb-3 text-lg font-bold text-ink">Ready to pay</h2>
            {payableByCreator.length === 0 ? (
                <div className="mb-10 rounded-2xl border border-grey-200 bg-white p-5 text-sm text-grey-500">
                    No payable commissions right now.
                </div>
            ) : (
                <div className="mb-10 space-y-3">
                    {payableByCreator.map((p) => (
                        <div key={p.creatorId} className="flex items-center justify-between rounded-2xl border border-grey-200 bg-white p-5">
                            <div>
                                <p className="font-bold text-ink">{nameById.get(p.creatorId) ?? "Creator"}</p>
                                <p className="text-xs text-grey-400">{p._count._all} commissions</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-ink">{formatINR(Number(p._sum.commissionAmount ?? 0))}</span>
                                {canManage && (
                                    <ActionButton
                                        endpoint="/api/admin/payouts"
                                        method="POST"
                                        body={{ creatorId: p.creatorId }}
                                        label="Create payout"
                                        successMessage="Payout created."
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h2 className="mb-3 text-lg font-bold text-ink">Payout history</h2>
            {payouts.length === 0 ? (
                <EmptyState title="No payouts yet." description="Created payouts appear here." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Creator</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                                {canManage && <th className="px-5 py-3">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {payouts.map((p) => (
                                <tr key={p.id} className="hover:bg-paper-soft/50">
                                    <td className="px-5 py-3 font-semibold text-ink">{p.creator.displayName}</td>
                                    <td className="px-5 py-3 font-bold text-ink">{formatINR(Number(p.amount))}</td>
                                    <td className="px-5 py-3 text-grey-500">{formatDate(p.paidAt ?? p.createdAt)}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                                    </td>
                                    {canManage && (
                                        <td className="px-5 py-3">
                                            {p.status !== "PAID" && (
                                                <ActionButton
                                                    endpoint="/api/admin/payouts"
                                                    body={{ payoutId: p.id, action: "mark_paid" }}
                                                    label="Mark paid"
                                                    size="sm"
                                                    confirm="Mark this payout as paid? Do this only after paying externally."
                                                    successMessage="Marked paid."
                                                />
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="mt-6 text-xs text-grey-400">
                BeeKL never stores raw bank or payment credentials. Actual money
                movement happens via your external payment provider; here we only
                record the payout status and an optional reference.
            </p>
        </div>
    );
}
