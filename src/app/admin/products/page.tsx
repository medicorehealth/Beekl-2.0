import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { isStorefrontConfigured } from "@/lib/shopify/types";

export const metadata: Metadata = { title: "Admin · Products", robots: { index: false } };

export default async function AdminProductsPage() {
    await requirePermission("products.view", "/admin/products");

    const products = await safe(
        () =>
            prisma.productReference.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    creator: { select: { displayName: true } },
                    community: { select: { name: true } },
                },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Products" subtitle="BeeKL product references enriched with editorial metadata." />

            <div className="mb-6 rounded-xl border border-grey-200 bg-white px-4 py-3 text-sm text-grey-500">
                {isStorefrontConfigured() ? (
                    <>Shopify is the commerce source of truth. These references link Shopify products to creators, communities, drops and stories.</>
                ) : (
                    <>Shopify isn&apos;t connected — products shown use seeded demo references. Connect Shopify to manage live commerce.</>
                )}
            </div>

            {products.length === 0 ? (
                <EmptyState title="No products yet." description="Products appear here once created or synced from Shopify." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Creator</th>
                                <th className="px-5 py-3">Community</th>
                                <th className="px-5 py-3">Source</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-paper-soft/50">
                                    <td className="px-5 py-3 font-semibold text-ink">
                                        <Link href={`/products/${p.handle}`} className="hover:text-flame">
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">{p.creator?.displayName ?? "—"}</td>
                                    <td className="px-5 py-3 text-grey-500">{p.community?.name ?? "—"}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone="neutral">{p.source}</Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
