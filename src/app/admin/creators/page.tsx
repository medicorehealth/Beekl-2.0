import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButtons";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { bpsToPercent, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Creators", robots: { index: false } };

export default async function AdminCreatorsPage() {
    const user = await requirePermission("creators.view", "/admin/creators");
    const canManage = user.permissions.includes("creators.manage");

    const creators = await safe(
        () =>
            prisma.creator.findMany({
                orderBy: { createdAt: "desc" },
                include: { user: { select: { email: true } }, _count: { select: { products: true } } },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Creators" subtitle="Approve, feature and manage creators." />

            {creators.length === 0 ? (
                <EmptyState title="No creators yet." description="Creator applications appear here." />
            ) : (
                <div className="space-y-3">
                    {creators.map((c) => (
                        <div
                            key={c.id}
                            className="flex flex-col gap-4 rounded-2xl border border-grey-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-grey-100">
                                    {c.avatarImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={c.avatarImage} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-ink text-sm font-bold text-paper">
                                            {c.displayName.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-ink">{c.displayName}</span>
                                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                        {c.isFeatured && <Badge tone="honey">Featured</Badge>}
                                    </div>
                                    <p className="text-xs text-grey-400">
                                        @{c.handle} · {c.user.email} · {c._count.products} products ·{" "}
                                        {bpsToPercent(c.commissionRateBps)} · {formatDate(c.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {canManage && (
                                <div className="flex flex-wrap gap-2">
                                    {c.status !== "APPROVED" && c.status !== "FEATURED" && (
                                        <ActionButton
                                            endpoint="/api/admin/creators"
                                            body={{ creatorId: c.id, action: "approve" }}
                                            label="Approve"
                                            successMessage="Creator approved."
                                        />
                                    )}
                                    {c.status !== "SUSPENDED" ? (
                                        <ActionButton
                                            endpoint="/api/admin/creators"
                                            body={{ creatorId: c.id, action: "suspend" }}
                                            label="Suspend"
                                            variant="outline"
                                            confirm="Suspend this creator?"
                                            successMessage="Creator suspended."
                                        />
                                    ) : (
                                        <ActionButton
                                            endpoint="/api/admin/creators"
                                            body={{ creatorId: c.id, action: "restore" }}
                                            label="Restore"
                                            variant="outline"
                                            successMessage="Creator restored."
                                        />
                                    )}
                                    <ActionButton
                                        endpoint="/api/admin/creators"
                                        body={{ creatorId: c.id, action: c.isFeatured ? "unfeature" : "feature" }}
                                        label={c.isFeatured ? "Unfeature" : "Feature"}
                                        variant="ghost"
                                        successMessage="Updated."
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
