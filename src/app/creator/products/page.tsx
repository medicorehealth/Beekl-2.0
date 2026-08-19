import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Creator · Products", robots: { index: false } };

export default async function CreatorProductsPage() {
    const user = await getCurrentUser();
    const products = await safe(
        () =>
            prisma.productReference.findMany({
                where: { creator: { userId: user!.id } },
                orderBy: { createdAt: "desc" },
                include: { community: { select: { name: true } }, drop: { select: { name: true } } },
            }),
        []
    );

    return (
        <CreatorShell title="Products" subtitle="Your merchandise on BeeKL.">
            <div className="mb-6 rounded-xl border border-grey-200 bg-paper-soft px-4 py-3 text-sm text-grey-500">
                Products are created by BeeKL from your approved submissions and synced
                with Shopify. Submit new ideas from the{" "}
                <Link href="/creator/submissions" className="font-bold text-ink hover:text-flame">
                    Submissions
                </Link>{" "}
                tab.
            </div>

            {products.length ? (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Community</th>
                                <th className="px-5 py-3">Drop</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-5 py-3 font-semibold text-ink">
                                        {["ACTIVE"].includes(p.status) ? (
                                            <Link href={`/products/${p.handle}`} className="hover:text-flame">
                                                {p.title}
                                            </Link>
                                        ) : (
                                            p.title
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">{p.community?.name ?? "—"}</td>
                                    <td className="px-5 py-3 text-grey-500">{p.drop?.name ?? "—"}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState
                    title="No products yet."
                    description="Once BeeKL converts your approved design into a product, it'll appear here."
                    action={{ label: "Submit an idea", href: "/creator/submissions" }}
                />
            )}
        </CreatorShell>
    );
}
