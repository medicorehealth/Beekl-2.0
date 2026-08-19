import type { Metadata } from "next";
import { ShopToolbar } from "@/components/commerce/ShopToolbar";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { safe } from "@/lib/safe";
import { listProducts, applyFilters, sortToShopify } from "@/lib/catalog";

export const metadata: Metadata = {
    title: "Shop All",
    description:
        "Shop all BeeKL — Gen-Z fashion, creator merch, meme tees, hoodies and community-made drops.",
};

export const revalidate = 60;

export default async function ShopPage({
    searchParams,
}: {
    searchParams: { [k: string]: string | undefined };
}) {
    const { sortKey, reverse } = sortToShopify(searchParams.sort);
    const products = await safe(
        () => listProducts({ first: 48, sortKey, reverse }),
        []
    );
    const filtered = applyFilters(products, searchParams);

    return (
        <div className="bk-container py-10">
            <header className="mb-6">
                <span className="bk-kicker mb-2">Everything</span>
                <h1 className="font-display text-display-sm text-ink">Shop All</h1>
                <p className="mt-2 max-w-lg text-grey-500">
                    The whole BeeKL universe — tees, hoodies, drops and creator merch.
                </p>
            </header>
            <ShopToolbar total={filtered.length} />
            <ProductGrid products={filtered} />
        </div>
    );
}
