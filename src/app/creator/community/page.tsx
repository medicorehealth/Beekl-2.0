import type { Metadata } from "next";
import Link from "next/link";
import { Users, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Creator · Community", robots: { index: false } };

export default async function CreatorCommunityPage() {
    const user = await getCurrentUser();
    const communities = await safe(
        () =>
            prisma.community.findMany({
                where: { creator: { userId: user!.id } },
                orderBy: { createdAt: "desc" },
                include: {
                    _count: { select: { members: true, products: true } },
                },
            }),
        []
    );

    return (
        <CreatorShell title="Community" subtitle="Your community hubs.">
            {communities.length ? (
                <div className="space-y-4">
                    {communities.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-grey-200 bg-white p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-ink">{c.name}</h3>
                                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-grey-500">/{c.slug}</p>
                                </div>
                                {["APPROVED", "FEATURED"].includes(c.status) && (
                                    <Link
                                        href={`/communities/${c.slug}`}
                                        className="flex items-center gap-1 text-sm font-bold text-ink hover:text-flame"
                                    >
                                        View public page <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                )}
                            </div>
                            {c.description && (
                                <p className="mt-3 text-sm text-grey-600">{c.description}</p>
                            )}
                            <div className="mt-4 flex gap-6 text-sm">
                                <span className="flex items-center gap-1.5 text-grey-600">
                                    <Users className="h-4 w-4" /> {c._count.members} members
                                </span>
                                <span className="text-grey-600">{c._count.products} products</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No community yet."
                    description="Your community is created when an admin approves your creator profile. Once live, you can manage it here."
                />
            )}
        </CreatorShell>
    );
}
