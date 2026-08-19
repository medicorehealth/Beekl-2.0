import type { Metadata } from "next";
import { CategoryHero } from "@/components/layout/CategoryHero";
import { CreatorCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { ButtonLink } from "@/components/ui/Button";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
    title: "Creators",
    description: "Meet the creators building communities and merch on BeeKL.",
};

export const revalidate = 60;

export default async function CreatorsPage() {
    const creators = await safe(
        () =>
            prisma.creator.findMany({
                where: { status: { in: ["APPROVED", "FEATURED"] } },
                orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
                include: { _count: { select: { products: true } } },
            }),
        []
    );

    return (
        <div>
            <CategoryHero
                kicker="The community makes the clothes"
                title="Creators."
                description="The people turning internet culture into things you can actually wear. Every purchase pays them a commission."
                image="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600&q=80"
            />
            <div className="bk-container py-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-grey-500">
                        {creators.length} {creators.length === 1 ? "creator" : "creators"} and counting.
                    </p>
                    <ButtonLink href="/register?as=creator" variant="outline" size="sm">
                        Become a Creator
                    </ButtonLink>
                </div>

                {creators.length ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {creators.map((c) => (
                            <CreatorCard
                                key={c.id}
                                handle={c.handle}
                                displayName={c.displayName}
                                avatarImage={c.avatarImage}
                                bannerImage={c.bannerImage}
                                isFeatured={c.isFeatured}
                                productCount={c._count.products}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No creators yet."
                        description="Be the first to build a community on BeeKL."
                        action={{ label: "Become a Creator", href: "/register?as=creator" }}
                    />
                )}
            </div>
        </div>
    );
}
