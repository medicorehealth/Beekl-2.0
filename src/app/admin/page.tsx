import type { Metadata } from "next";
import Link from "next/link";
import {
    IndianRupee,
    ShoppingCart,
    Users,
    UserCog,
    Boxes,
    Package,
    Lightbulb,
    Truck,
    Wallet,
    ArrowRight,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge, statusTone } from "@/components/ui/Badge";
import { DataUnavailable } from "@/components/ui/States";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { isAdminConfigured } from "@/lib/shopify/types";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Dashboard", robots: { index: false } };

export default async function AdminDashboardPage() {
    // Real counts from the DB.
    const [
        customers,
        creators,
        communities,
        products,
        pendingSubmissions,
        pendingCommissions,
        pendingPayouts,
        unfulfilled,
        recentCreators,
    ] = await Promise.all([
        safe(() => prisma.user.count({ where: { role: "CUSTOMER" } }), 0),
        safe(() => prisma.creator.count(), 0),
        safe(() => prisma.community.count(), 0),
        safe(() => prisma.productReference.count(), 0),
        safe(() => prisma.designSubmission.count({ where: { status: { in: ["NEW", "UNDER_REVIEW"] } } }), 0),
        safe(() => prisma.commission.count({ where: { status: "PENDING" } }), 0),
        safe(() => prisma.payout.count({ where: { status: "PENDING" } }), 0),
        safe(() => prisma.orderReference.count({ where: { fulfillmentStatus: "UNFULFILLED" } }), 0),
        safe(
            () =>
                prisma.creator.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: { id: true, displayName: true, handle: true, status: true, createdAt: true },
                }),
            []
        ),
    ]);

    // Revenue is Shopify's truth. Show real DB commission totals as a proxy metric.
    const commissionAgg = await safe(
        () => prisma.commission.aggregate({ _sum: { grossAmount: true } }),
        null
    );
    const grossTracked = Number(commissionAgg?._sum.grossAmount ?? 0);

    return (
        <div className="p-5 md:p-8">
            <AdminHeader
                title="Dashboard"
                subtitle="Your BeeKL control center."
            />

            {/* Primary metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatsCard
                    label="Revenue (tracked)"
                    value={isAdminConfigured() ? formatINR(grossTracked) : "—"}
                    sub={isAdminConfigured() ? "From attributed orders" : "Connect Shopify"}
                    icon={<IndianRupee className="h-4 w-4" />}
                    tone="dark"
                />
                <StatsCard label="Customers" value={customers} icon={<Users className="h-4 w-4" />} />
                <StatsCard label="Creators" value={creators} icon={<UserCog className="h-4 w-4" />} />
                <StatsCard label="Communities" value={communities} icon={<Boxes className="h-4 w-4" />} />
            </div>

            {/* Secondary metrics */}
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatsCard label="Products" value={products} icon={<Package className="h-4 w-4" />} />
                <StatsCard label="Pending submissions" value={pendingSubmissions} icon={<Lightbulb className="h-4 w-4" />} />
                <StatsCard label="Pending fulfillment" value={unfulfilled} icon={<Truck className="h-4 w-4" />} />
                <StatsCard label="Pending commissions" value={pendingCommissions} icon={<Wallet className="h-4 w-4" />} />
            </div>

            {/* Action queues */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-grey-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-ink">Needs attention</h2>
                    </div>
                    <ul className="space-y-2">
                        <QueueRow label="Design submissions to review" count={pendingSubmissions} href="/admin/submissions" />
                        <QueueRow label="Commissions to approve" count={pendingCommissions} href="/admin/commissions" />
                        <QueueRow label="Payouts to process" count={pendingPayouts} href="/admin/payouts" />
                        <QueueRow label="Orders to fulfil" count={unfulfilled} href="/admin/pod" />
                    </ul>
                </div>

                <div className="rounded-2xl border border-grey-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-ink">New creators</h2>
                        <Link href="/admin/creators" className="text-sm font-bold text-ink hover:text-flame">
                            View all
                        </Link>
                    </div>
                    {recentCreators.length ? (
                        <ul className="divide-y divide-grey-100">
                            {recentCreators.map((c) => (
                                <li key={c.id} className="flex items-center justify-between py-2.5">
                                    <div>
                                        <p className="text-sm font-semibold text-ink">{c.displayName}</p>
                                        <p className="text-xs text-grey-400">
                                            @{c.handle} · {formatDate(c.createdAt)}
                                        </p>
                                    </div>
                                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-grey-400">No creators yet.</p>
                    )}
                </div>
            </div>

            {/* Revenue note */}
            {!isAdminConfigured() && (
                <div className="mt-8">
                    <DataUnavailable note="Live revenue, orders and analytics require the Shopify Admin API. Configure SHOPIFY_ADMIN_ACCESS_TOKEN to enable." />
                </div>
            )}
        </div>
    );
}

function QueueRow({ label, count, href }: { label: string; count: number; href: string }) {
    return (
        <li>
            <Link
                href={href}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-paper-soft"
            >
                <span className="text-sm text-grey-600">{label}</span>
                <span className="flex items-center gap-2">
                    <span
                        className={
                            "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold " +
                            (count > 0 ? "bg-flame text-white" : "bg-grey-100 text-grey-400")
                        }
                    >
                        {count}
                    </span>
                    <ArrowRight className="h-4 w-4 text-grey-300" />
                </span>
            </Link>
        </li>
    );
}
