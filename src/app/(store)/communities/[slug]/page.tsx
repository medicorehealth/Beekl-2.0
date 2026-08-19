import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { DropCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FollowButton } from "@/components/community/FollowButton";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";
import { listProductsByCommunity } from "@/lib/catalog";
import { SITE } from "@/lib/constants";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const community = await safe(
        () => prisma.community.findUnique({ where: { slug: params.slug } }),
        null
    );
    if (!community) return { title: "Community not found" };
    return {
        title: community.name,
        description: community.description ?? `${community.name} on BeeKL. ${SITE.description}`,
        alternates: { canonical: `/communities/${community.slug}` },
    };
}

export const revalidate = 60;

export default async function CommunityPage({ params }: Props) {
    const community = await safe(
        () =>
            prisma.community.findUnique({
                where: { slug: params.slug },
                include: {
                    creator: { select: { displayName: true, handle: true, avatarImage: true } },
                    drops: {
                        where: { status: { in: ["LIVE", "UPCOMING"] } },
                        take: 4,
                        include: { creator: { select: { displayName: true } } },
                    },
                    _count: { select: { members: true } },
                },
            }),
        null
    );

    if (!community || !["APPROVED", "FEATURED"].includes(community.status)) {
        notFound();
    }

    const products = await safe(() => listProductsByCommunity(params.slug), []);

    return (
        <div>
            {/* Banner */}
            <section className="relative flex min-h-[320px] items-end overflow-hidden bg-ink">
                {community.bannerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={community.bannerImage}
                        alt={community.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                <div className="bk-container relative z-10 py-10">
                    <Link
                        href={`/creators/${community.creator.handle}`}
                        className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-honey"
                    >
                        by {community.creator.displayName}
                    </Link>
                    <h1 className="font-display text-display-md text-paper">{community.name}</h1>
                    {community.description && (
                        <p className="mt-3 max-w-xl text-paper/70">{community.description}</p>
                    )}
                    <div className="mt-5 flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-sm text-paper/70">
                            <Users className="h-4 w-4" />
                            {community._count.members} members
                        </span>
                        <FollowButton communityId={community.id} />
                    </div>
                </div>
            </section>

            <div className="bk-container space-y-12 py-10">
                {/* Featured drop */}
                {community.drops.length > 0 && (
                    <section>
                        <SectionHeader title="Drops" href="/drops" />
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {community.drops.map((d) => (
                                <DropCard
                                    key={d.id}
                                    slug={d.slug}
                                    name={d.name}
                                    status={d.status}
                                    bannerImage={d.bannerImage}
                                    releaseAt={d.releaseAt}
                                    creatorName={d.creator?.displayName ?? null}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Products */}
                <section>
                    <SectionHeader title="Latest Designs" />
                    {products.length ? (
                        <ProductGrid products={products} />
                    ) : (
                        <EmptyState
                            title="No products yet."
                            description="This community hasn't dropped merch yet."
                        />
                    )}
                </section>
            </div>
        </div>
    );
}
