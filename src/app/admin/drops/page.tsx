import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButtons";
import { CreateDropForm } from "@/components/admin/CreateDropForm";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Drops", robots: { index: false } };

export default async function AdminDropsPage() {
    const user = await requirePermission("drops.view", "/admin/drops");
    const canManage = user.permissions.includes("drops.manage");

    const drops = await safe(
        () =>
            prisma.drop.findMany({
                orderBy: { createdAt: "desc" },
                include: { _count: { select: { products: true } } },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader
                title="Drops"
                subtitle="Create and schedule limited drops."
                action={canManage ? <CreateDropForm /> : undefined}
            />
            {drops.length === 0 ? (
                <EmptyState title="No drops yet." description="Create your first limited drop." />
            ) : (
                <div className="space-y-3">
                    {drops.map((d) => (
                        <div
                            key={d.id}
                            className="flex flex-col gap-4 rounded-2xl border border-grey-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link href={`/drops/${d.slug}`} className="font-bold text-ink hover:text-flame">
                                        {d.name}
                                    </Link>
                                    <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                                    {d.isFeatured && <Badge tone="honey">Featured</Badge>}
                                </div>
                                <p className="text-xs text-grey-400">
                                    /{d.slug} · {d._count.products} products
                                    {d.releaseAt && ` · releases ${formatDate(d.releaseAt)}`}
                                </p>
                            </div>
                            {canManage && (
                                <div className="flex flex-wrap gap-2">
                                    {d.status !== "LIVE" && (
                                        <ActionButton endpoint="/api/admin/drops" body={{ dropId: d.id, action: "publish" }} label="Go Live" successMessage="Drop is live." />
                                    )}
                                    {d.status !== "ENDED" && (
                                        <ActionButton endpoint="/api/admin/drops" body={{ dropId: d.id, action: "end" }} label="End" variant="outline" confirm="End this drop?" successMessage="Drop ended." />
                                    )}
                                    <ActionButton endpoint="/api/admin/drops" body={{ dropId: d.id, action: d.isFeatured ? "unfeature" : "feature" }} label={d.isFeatured ? "Unfeature" : "Feature"} variant="ghost" successMessage="Updated." />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
