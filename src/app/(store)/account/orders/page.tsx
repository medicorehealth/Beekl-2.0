import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AccountShell } from "@/components/dashboard/AccountNav";
import { EmptyState } from "@/components/ui/States";
import { Badge, statusTone } from "@/components/ui/Badge";
import { isAdminConfigured } from "@/lib/shopify/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Package } from "lucide-react";

export const metadata: Metadata = { title: "My Orders", robots: { index: false } };

export default async function OrdersPage() {
    const user = await requireUser("/account/orders");

    // Orders are Shopify's source of truth. We show BeeKL OrderReferences that
    // have been linked to this user. If Shopify Admin isn't connected we say so.
    const orders = await safe(
        () =>
            prisma.orderReference.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
            }),
        []
    );

    return (
        <AccountShell title="My Account" subtitle="Track your orders.">
            <h2 className="mb-4 text-lg font-bold text-ink">Orders</h2>

            {!isAdminConfigured() && (
                <div className="mb-6 rounded-xl border border-grey-200 bg-paper-soft px-4 py-3 text-sm text-grey-500">
                    Order history syncs from Shopify. It isn&apos;t connected in this
                    environment yet, so live orders won&apos;t appear here.
                </div>
            )}

            {orders.length ? (
                <ul className="space-y-3">
                    {orders.map((o) => (
                        <li
                            key={o.id}
                            className="flex items-center justify-between rounded-2xl border border-grey-200 bg-white p-5"
                        >
                            <div>
                                <p className="font-bold text-ink">
                                    {o.orderNumber || `Order ${o.id.slice(0, 6)}`}
                                </p>
                                <p className="text-sm text-grey-400">
                                    {formatDate(o.processedAt ?? o.createdAt)}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-ink">
                                    {formatINR(Number(o.totalAmount))}
                                </span>
                                <Badge tone={statusTone(o.fulfillmentStatus)}>
                                    {o.fulfillmentStatus}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={<Package className="h-6 w-6" />}
                    title="No orders yet."
                    description="When you place an order, it'll show up here with tracking."
                    action={{ label: "Start shopping", href: "/shop" }}
                />
            )}
        </AccountShell>
    );
}
