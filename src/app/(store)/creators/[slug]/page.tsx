import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Instagram, Youtube, Globe, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { CommunityCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FollowButton } from "@/components/community/FollowButton";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";
import { listProductsByCreator } from "@/lib/catalog";
import { SITE } from "@/lib/constants";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const creator = await safe(
        () => prisma.creator.findUnique({ where: { handle: params.slug } }),
        null
    );
    if (!creator) return { title: "Creator not found" };
    return {
        title: creator.displayName,
        description: creator.bio ?? `${creator.displayName} on BeeKL. ${SITE.description}`,
        alternates: { canonical: `/creators/${creator.handle}` },
        openGraph: {
            title: creator.displayName,
            images: creator.avatarImage ? [{ url: creator.avatarImage }] : undefined,
        },
    };
}

export const revalidate = 60;

export default async function CreatorPage({ params }: Props) {
    const creator = await safe(
        () =>
            prisma.creator.findUnique({
                where: { handle: params.slug },
                include: {
                    communities: {
                        where: { status: { in: ["APPROVED", "FEATURED"] } },
                        include: { _count: { select: { members: true } } },
                    },
                    drops: { where: { isFeatured: true }, take: 1 },
                },
            }),
        null
    );

    if (!creator || !["APPROVED", "FEATURED"].includes(creator.status)) {
        notFound();
    }

    const products = await safe(() => listProductsByCreator(params.slug), []);
    const socials = (creator.socialLinks as Record<string, string> | null) ?? {};

    return (
        <div>
            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-br from-charcoal to-ink md:h-64">
                {creator.bannerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={creator.bannerImage}
                        alt=""
                        className="h-full w-full object-cover opacity-70"
                    />
                )}
            </div>

            <div className="bk-container">
                {/* Profile header */}
                <div className="-mt-16 flex flex-col items-start gap-4 pb-8 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-end gap-4">
                        <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-paper bg-grey-100">
                            {creator.avatarImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={creator.avatarImage} alt={creator.displayName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-ink text-2xl font-bold text-paper">
                                    {creator.displayName.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="pb-1">
                            <div className="flex items-center gap-2">
                                <h1 className="font-display text-3xl font-bold text-ink">
                                    {creator.displayName}
                                </h1>
                                {creator.isFeatured && (
                                    <Badge tone="honey">
                                        <Sparkles className="h-3 w-3" /> Featured
                                    </Badge>
                                )}
                            </div>
                            <p className="text-grey-400">@{creator.handle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {socials.instagram && (
                            <SocialLink href={socials.instagram} icon={<Instagram className="h-5 w-5" />} />
                        )}
                        {socials.youtube && (
                            <SocialLink href={socials.youtube} icon={<Youtube className="h-5 w-5" />} />
                        )}
                        {socials.website && (
                            <SocialLink href={socials.website} icon={<Globe className="h-5 w-5" />} />
                        )}
                        {creator.communities[0] && (
                            <FollowButton communityId={creator.communities[0].id} />
                        )}
                    </div>
                </div>

                {creator.bio && (
                    <p className="mb-10 max-w-2xl text-grey-600">{creator.bio}</p>
                )}

                {/* Communities */}
                {creator.communities.length > 0 && (
                    <div className="mb-12">
                        <SectionHeader title="Communities" />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {creator.communities.map((c) => (
                                <CommunityCard
                                    key={c.id}
                                    slug={c.slug}
                                    name={c.name}
                                    description={c.description}
                                    bannerImage={c.bannerImage}
                                    memberCount={c._count.members}
                                    creatorName={creator.displayName}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Products */}
                <div className="pb-12">
                    <SectionHeader title="Merch" />
                    {products.length ? (
                        <ProductGrid products={products} />
                    ) : (
                        <EmptyState
                            title="No products yet."
                            description={`${creator.displayName} hasn't dropped merch yet. Follow to be first in line.`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-grey-200 text-ink hover:bg-grey-100"
        >
            {icon}
        </a>
    );
}
