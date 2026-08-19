import type { Metadata } from "next";
import { CategoryHero } from "@/components/layout/CategoryHero";
import { DropCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
    title: "Drops",
    description: "Limited BeeKL drops — community-made, small batch, gone in a blink.",
};

export const revalidate = 60;

export default async function DropsPage() {
    const drops = await safe(
        () =>
            prisma.drop.findMany({
                orderBy: [{ status: "asc" }, { releaseAt: "asc" }],
                include: { creator: { select: { displayName: true } } },
            }),
        []
    );

    const live = drops.filter((d) => d.status === "LIVE");
    const upcoming = drops.filter((d) => d.status === "UPCOMING");
    const ended = drops.filter((d) => d.status === "ENDED");

    return (
        <div>
            <CategoryHero
                kicker="Blink and it's gone"
                title="Limited Drops."
                description="Small batches. Big moments. When it's gone, it's gone."
                image="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
            />

            <div className="bk-container space-y-12 py-10">
                {drops.length === 0 && (
                    <EmptyState
                        title="No drops yet."
                        description="New limited drops will land here. Follow along and be ready."
                        action={{ label: "Shop all", href: "/shop" }}
                    />
                )}

                {live.length > 0 && (
                    <DropSection title="Live Now" drops={live} />
                )}
                {upcoming.length > 0 && (
                    <DropSection title="Upcoming" drops={upcoming} />
                )}
                {ended.length > 0 && (
                    <DropSection title="Archive" drops={ended} />
                )}
            </div>
        </div>
    );
}

function DropSection({
    title,
    drops,
}: {
    title: string;
    drops: {
        id: string;
        slug: string;
        name: string;
        status: string;
        bannerImage: string | null;
        releaseAt: Date | null;
        creator: { displayName: string } | null;
    }[];
}) {
    return (
        <section>
            <h2 className="mb-5 font-display text-2xl font-bold text-ink">{title}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {drops.map((d) => (
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
    );
}
