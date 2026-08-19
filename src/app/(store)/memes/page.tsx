import type { Metadata } from "next";
import { CategoryHero } from "@/components/layout/CategoryHero";
import { ShopToolbar } from "@/components/commerce/ShopToolbar";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { safe } from "@/lib/safe";
import { listProductsByCollectionKind, listProducts, applyFilters } from "@/lib/catalog";

export const metadata: Metadata = {
    title: "Memes",
    description: "Meme-inspired and internet-culture clothing on BeeKL. Original and community-made designs — wearable chaos.",
};

export const revalidate = 60;

export default async function MemesPage({
    searchParams,
}: {
    searchParams: { [k: string]: string | undefined };
}) {
    const products = await safe(async () => {
        const byKind = await listProductsByCollectionKind("MEMES");
        if (byKind.length) return byKind;
        return listProducts({ first: 48, tag: "meme" });
    }, []);
    const filtered = applyFilters(products, searchParams);

    return (
        <div>
            <CategoryHero
                kicker="Certified Unserious"
                title="Wearable chaos."
                description="The memes you send at 2am — now on a tee. 100% original or community-made art. We never print stolen work."
                image="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&q=80"
            />
            <div className="bk-container py-10">
                <ShopToolbar total={filtered.length} />
                <ProductGrid products={filtered} />
            </div>
        </div>
    );
}
