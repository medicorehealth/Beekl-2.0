import type { Metadata } from "next";
import { CategoryHero } from "@/components/layout/CategoryHero";
import { ShopToolbar } from "@/components/commerce/ShopToolbar";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { safe } from "@/lib/safe";
import { listProductsByCollectionKind, listProducts, applyFilters } from "@/lib/catalog";

export const metadata: Metadata = {
    title: "Anime",
    description: "Anime-inspired and original anime-style clothing on BeeKL, offered only where legally licensed or fully original.",
};

export const revalidate = 60;

export default async function AnimePage({
    searchParams,
}: {
    searchParams: { [k: string]: string | undefined };
}) {
    const products = await safe(async () => {
        const byKind = await listProductsByCollectionKind("ANIME");
        if (byKind.length) return byKind;
        return listProducts({ first: 48, tag: "anime" });
    }, []);
    const filtered = applyFilters(products, searchParams);

    return (
        <div>
            <CategoryHero
                kicker="For the culture"
                title="Anime, done right."
                description="Original anime-style art and properly licensed collections. No bootlegs — just fits for the fandom."
                image="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80"
            />
            <div className="bk-container py-10">
                <div className="mb-6 rounded-xl border border-grey-200 bg-paper-soft px-4 py-3 text-xs text-grey-500">
                    Licensing note: BeeKL only sells anime merchandise that is either
                    fully original or properly licensed. We do not print copyrighted
                    characters without rights.
                </div>
                <ShopToolbar total={filtered.length} />
                <ProductGrid products={filtered} />
            </div>
        </div>
    );
}
