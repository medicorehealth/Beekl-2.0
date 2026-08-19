import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DataUnavailable } from "@/components/ui/States";
import { isAdminConfigured } from "@/lib/shopify/types";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Analytics", robots: { index: false } };

export default async function AdminAnalyticsPage() {
    await requirePermission("analytics.view", "/admin/analytics");

    // Real platform counts from the DB.
    const [customers, creators, communities, products, drops, commissionsAgg] =
        await Promise.all([
            safe(() => prisma.user.count({ where: { role: "CUSTOMER" } }), 0),
            safe(() => prisma.creator.count(), 0),
            safe(() => prisma.community.count(), 0),
            safe(() => prisma.productReference.count(), 0),
            safe(() => prisma.drop.count(), 0),
            safe(
                () => prisma.commission.aggregate({ _sum: { commissionAmount: true, grossAmount: true } }),
                null
            ),
        ]);

    const salesConnected = isAdminConfigured();

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Analytics" subtitle="Real platform metrics. Never fabricated." />

            {/* Platform */}
            <h2 className="mb-4 text-lg font-bold text-ink">Platform</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatsCard label="Customers" value={customers} />
                <StatsCard label="Creators" value={creators} />
                <StatsCard label="Communities" value={communities} />
                <StatsCard label="Products" value={products} />
                <StatsCard label="Drops" value={drops} />
                <StatsCard
                    label="Creator commission (lifetime)"
                    value={commissionsAgg ? formatINR(Number(commissionsAgg._sum.commissionAmount ?? 0)) : "—"}
                    tone="dark"
                />
            </div>

            {/* Revenue */}
            <h2 className="mb-4 mt-8 text-lg font-bold text-ink">Revenue & Orders</h2>
            {salesConnected ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatsCard label="Revenue" value="—" sub="Awaiting order sync" />
                    <StatsCard label="Orders" value="—" sub="Awaiting order sync" />
                    <StatsCard label="AOV" value="—" sub="Awaiting order sync" />
                    <StatsCard label="Customer growth" value="—" sub="Awaiting order sync" />
                </div>
            ) : (
                <DataUnavailable note="Revenue, orders, AOV and growth require the Shopify Admin API + analytics events. Configure Shopify to populate these." />
            )}

            <p className="mt-6 text-xs text-grey-400">
                BeeKL never manufactures analytics. Metrics shown are real database
                counts. Sales metrics activate once Shopify is connected and orders
                begin syncing into the AnalyticsDaily rollups.
            </p>
        </div>
    );
}
