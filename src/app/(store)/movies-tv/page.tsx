import type { Metadata } from "next";
import { CategoryHero } from "@/components/layout/CategoryHero";
import { ShopToolbar } from "@/components/commerce/ShopToolbar";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { safe } from "@/lib/safe";
import { listProductsByCollectionKind, listProducts, applyFilters } from "@/lib/catalog";

export const metadata: Metadata = {
    title: "Movies & TV",
    description: "Movie and web-series inspired clothing on BeeKL, offered only where legally licensed or fully original.",
};

export const revalidate = 60;

export default async function MoviesTvPage({
    searchParams,
}: {
    searchParams: { [k: string]: string | undefined };
}) {
    const products = await safe(async () => {
        const byKind = await listProductsByCollectionKind("MOVIES_TV");
        if (byKind.length) return byKind;
        return listProducts({ first: 48, tag: "movies-tv" });
    }, []);
    const filtered = applyFilters(products, searchParams);

    return (
        <div>
            <CategoryHero
                kicker="Screen to street"
                title="Movies & TV."
                description="Iconic moments from the shows and films you rewatch — offered only where legally licensed."
                image="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80"
            />
            <div className="bk-container py-10">
                <div className="mb-6 rounded-xl border border-grey-200 bg-paper-soft px-4 py-3 text-xs text-grey-500">
                    Licensing note: Movie, web-series and pop-culture merchandise is sold
                    strictly where BeeKL holds the appropriate license or the design is
                    fully original.
                </div>
                <ShopToolbar total={filtered.length} />
                <ProductGrid products={filtered} />
            </div>
        </div>
    );
}
