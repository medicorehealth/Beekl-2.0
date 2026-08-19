import type { Metadata } from "next";
import { CollectionCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
    title: "Collections",
    description: "Explore BeeKL collections — memes, anime, movies & TV, creator merch, oversized, hoodies, limited drops and BeeKL originals.",
};

export const revalidate = 60;

export default async function CollectionsPage() {
    const collections = await safe(
        () =>
            prisma.collectionRef.findMany({
                orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
                include: { _count: { select: { products: true } } },
            }),
        []
    );

    return (
        <div className="bk-container py-10">
            <header className="mb-8">
                <span className="bk-kicker mb-2">Curated</span>
                <h1 className="font-display text-display-sm text-ink">Collections</h1>
                <p className="mt-2 max-w-lg text-grey-500">
                    Culture, sorted. Find your corner of the internet.
                </p>
            </header>

            {collections.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {collections.map((c) => (
                        <CollectionCard
                            key={c.id}
                            slug={c.slug}
                            title={c.title}
                            image={c.heroImage}
                            count={c._count.products}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No collections yet."
                    description="Collections will appear here once they're published."
                    action={{ label: "Shop all", href: "/shop" }}
                />
            )}
        </div>
    );
}
