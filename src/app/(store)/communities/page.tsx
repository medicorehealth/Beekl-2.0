import type { Metadata } from "next";
import { CategoryHero } from "@/components/layout/CategoryHero";
import { CommunityCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
    title: "Communities",
    description: "Explore BeeKL communities — creator hubs, stores and fandoms making clothes together.",
};

export const revalidate = 60;

export default async function CommunitiesPage() {
    const communities = await safe(
        () =>
            prisma.community.findMany({
                where: { status: { in: ["APPROVED", "FEATURED"] } },
                orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
                include: {
                    creator: { select: { displayName: true } },
                    _count: { select: { members: true } },
                },
            }),
        []
    );

    return (
        <div>
            <CategoryHero
                kicker="Creator hub + store + community"
                title="Communities."
                description="Every community is a creator's world — their people, their designs, their store."
                image="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80"
            />
            <div className="bk-container py-10">
                {communities.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {communities.map((c) => (
                            <CommunityCard
                                key={c.id}
                                slug={c.slug}
                                name={c.name}
                                description={c.description}
                                bannerImage={c.bannerImage}
                                memberCount={c._count.members}
                                creatorName={c.creator.displayName}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No communities yet."
                        description="Creators are just getting started. Check back soon."
                        action={{ label: "Become a Creator", href: "/register?as=creator" }}
                    />
                )}
            </div>
        </div>
    );
}
