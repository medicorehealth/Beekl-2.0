import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButtons";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Admin · Communities", robots: { index: false } };

export default async function AdminCommunitiesPage() {
    const user = await requirePermission("communities.view", "/admin/communities");
    const canManage = user.permissions.includes("communities.manage");

    const communities = await safe(
        () =>
            prisma.community.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    creator: { select: { displayName: true } },
                    _count: { select: { members: true, products: true } },
                },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Communities" subtitle="Approve, suspend and feature communities." />
            {communities.length === 0 ? (
                <EmptyState title="No communities yet." description="Communities appear here once creators are approved." />
            ) : (
                <div className="space-y-3">
                    {communities.map((c) => (
                        <div
                            key={c.id}
                            className="flex flex-col gap-4 rounded-2xl border border-grey-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-ink">{c.name}</span>
                                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                    {c.isFeatured && <Badge tone="honey">Featured</Badge>}
                                </div>
                                <p className="text-xs text-grey-400">
                                    /{c.slug} · by {c.creator.displayName} · {c._count.members} members ·{" "}
                                    {c._count.products} products
                                </p>
                            </div>
                            {canManage && (
                                <div className="flex flex-wrap gap-2">
                                    {c.status !== "APPROVED" && c.status !== "FEATURED" ? (
                                        <ActionButton endpoint="/api/admin/communities" body={{ communityId: c.id, action: "approve" }} label="Approve" successMessage="Approved." />
                                    ) : (
                                        <ActionButton endpoint="/api/admin/communities" body={{ communityId: c.id, action: "suspend" }} label="Suspend" variant="outline" confirm="Suspend this community?" successMessage="Suspended." />
                                    )}
                                    <ActionButton endpoint="/api/admin/communities" body={{ communityId: c.id, action: c.isFeatured ? "unfeature" : "feature" }} label={c.isFeatured ? "Unfeature" : "Feature"} variant="ghost" successMessage="Updated." />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
