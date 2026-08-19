import type { Metadata } from "next";
import Link from "next/link";
import {
    Wallet,
    Package,
    ShoppingBag,
    TrendingUp,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { DataUnavailable } from "@/components/ui/States";
import { getCreatorCommissionSummary } from "@/lib/commissions";
import { formatINR, bpsToPercent } from "@/lib/utils";
import { isAdminConfigured } from "@/lib/shopify/types";

export const metadata: Metadata = { title: "Creator Dashboard", robots: { index: false } };

export default async function CreatorOverviewPage() {
    const user = await getCurrentUser();

    const creator = await safe(
        () =>
            prisma.creator.findUnique({
                where: { userId: user!.id },
                include: {
                    _count: { select: { products: true, communities: true, drops: true } },
                    communities: { include: { _count: { select: { members: true } } } },
                },
            }),
        null
    );

    if (!creator) {
        return (
            <CreatorShell title="Creator Dashboard">
                <div className="rounded-2xl border border-grey-200 bg-white p-8 text-center">
                    <Sparkles className="mx-auto mb-3 h-8 w-8 text-honey" />
                    <h2 className="text-lg font-bold text-ink">Set up your creator profile</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm text-grey-500">
                        You have creator access but no profile yet. Create one to start a
                        community and sell merch.
                    </p>
                </div>
            </CreatorShell>
        );
    }

    const commissions = await safe(() => getCreatorCommissionSummary(creator.id), null);
    const memberTotal = creator.communities.reduce((sum, c) => sum + c._count.members, 0);

    // Orders/sales come from Shopify. Without Admin API we can't show real sales.
    const salesConnected = isAdminConfigured();

    return (
        <CreatorShell title="Creator Dashboard" subtitle={`Welcome back, ${creator.displayName}.`}>
            {/* Status banner */}
            {creator.status !== "APPROVED" && creator.status !== "FEATURED" && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
                    <div>
                        <p className="font-bold text-ink">
                            Your creator account is {creator.status.toLowerCase()}.
                        </p>
                        <p className="text-sm text-grey-600">
                            An admin will review your profile. Some features unlock once
                            you&apos;re approved.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatsCard
                    label="Commission rate"
                    value={bpsToPercent(creator.commissionRateBps)}
                    icon={<TrendingUp className="h-4 w-4" />}
                    tone="dark"
                />
                <StatsCard
                    label="Products"
                    value={creator._count.products}
                    icon={<Package className="h-4 w-4" />}
                />
                <StatsCard
                    label="Members"
                    value={memberTotal}
                    sub={`${creator._count.communities} ${creator._count.communities === 1 ? "community" : "communities"}`}
                    icon={<ShoppingBag className="h-4 w-4" />}
                />
                <StatsCard
                    label="Payable commission"
                    value={commissions ? formatINR(commissions.PAYABLE.amount + commissions.APPROVED.amount) : "—"}
                    icon={<Wallet className="h-4 w-4" />}
                    tone="accent"
                />
            </div>

            {/* Sales */}
            <div className="mt-8">
                <h2 className="mb-4 text-lg font-bold text-ink">Sales</h2>
                {salesConnected ? (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatsCard label="Total sales" value="—" sub="Awaiting orders" />
                        <StatsCard label="Orders" value="—" sub="Awaiting orders" />
                        <StatsCard label="Top product" value="—" />
                        <StatsCard label="This month" value="—" />
                    </div>
                ) : (
                    <DataUnavailable note="Sales data syncs from Shopify orders, which isn't connected in this environment." />
                )}
            </div>

            {/* Commission summary */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">Commissions</h2>
                    <ButtonLink href="/creator/commissions" variant="ghost" size="sm">
                        View all
                    </ButtonLink>
                </div>
                {commissions ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {Object.entries(commissions).map(([status, data]) => (
                            <div key={status} className="rounded-xl border border-grey-200 bg-white p-4">
                                <Badge tone={statusTone(status)} className="mb-2">
                                    {status}
                                </Badge>
                                <p className="font-display text-xl font-bold text-ink">
                                    {formatINR(data.amount)}
                                </p>
                                <p className="text-xs text-grey-400">{data.count} entries</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <DataUnavailable />
                )}
            </div>

            {/* Quick actions */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ActionCard href="/creator/community" title="Manage community" body="Update your community page and members." />
                <ActionCard href="/creator/submissions" title="Submit a design" body="Send a new merch idea to BeeKL." />
                <ActionCard href="/creator/products" title="View products" body="See your live and pending merch." />
            </div>
        </CreatorShell>
    );
}

function ActionCard({ href, title, body }: { href: string; title: string; body: string }) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-grey-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover"
        >
            <h3 className="font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-grey-500">{body}</p>
        </Link>
    );
}
