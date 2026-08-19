import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DataUnavailable } from "@/components/ui/States";
import { getCreatorCommissionSummary } from "@/lib/commissions";
import { isAdminConfigured } from "@/lib/shopify/types";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Creator · Analytics", robots: { index: false } };

export default async function CreatorAnalyticsPage() {
    const user = await getCurrentUser();
    const creator = await safe(
        () =>
            prisma.creator.findUnique({
                where: { userId: user!.id },
                include: {
                    _count: { select: { products: true } },
                    communities: { include: { _count: { select: { members: true } } } },
                },
            }),
        null
    );

    const commissions = creator
        ? await safe(() => getCreatorCommissionSummary(creator.id), null)
        : null;

    const memberTotal =
        creator?.communities.reduce((s, c) => s + c._count.members, 0) ?? 0;

    return (
        <CreatorShell title="Analytics" subtitle="Your performance on BeeKL.">
            {/* Community analytics — real counts from DB */}
            <h2 className="mb-4 text-lg font-bold text-ink">Community</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatsCard label="Members" value={memberTotal} />
                <StatsCard label="Products" value={creator?._count.products ?? 0} />
                <StatsCard
                    label="Communities"
                    value={creator?.communities.length ?? 0}
                />
            </div>

            {/* Commission analytics — real from ledger */}
            <h2 className="mb-4 mt-8 text-lg font-bold text-ink">Earnings</h2>
            {commissions ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatsCard
                        label="Lifetime commission"
                        value={formatINR(
                            Object.values(commissions).reduce((s, v) => s + v.amount, 0)
                        )}
                        tone="dark"
                    />
                    <StatsCard label="Paid" value={formatINR(commissions.PAID.amount)} />
                    <StatsCard
                        label="Payable"
                        value={formatINR(commissions.PAYABLE.amount + commissions.APPROVED.amount)}
                        tone="accent"
                    />
                    <StatsCard label="Pending" value={formatINR(commissions.PENDING.amount)} />
                </div>
            ) : (
                <DataUnavailable />
            )}

            {/* Sales analytics — depends on Shopify */}
            <h2 className="mb-4 mt-8 text-lg font-bold text-ink">Sales</h2>
            {isAdminConfigured() ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatsCard label="Revenue" value="—" sub="Awaiting order data" />
                    <StatsCard label="Orders" value="—" sub="Awaiting order data" />
                    <StatsCard label="Units" value="—" sub="Awaiting order data" />
                    <StatsCard label="AOV" value="—" sub="Awaiting order data" />
                </div>
            ) : (
                <DataUnavailable note="Sales analytics require the Shopify Admin API connection." />
            )}
        </CreatorShell>
    );
}
