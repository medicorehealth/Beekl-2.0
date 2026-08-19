import type { Metadata } from "next";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { NoResults } from "@/components/ui/States";
import { safe } from "@/lib/safe";
import { listProducts } from "@/lib/catalog";

export const metadata: Metadata = {
    title: "Search",
    description: "Search BeeKL products, creators, drops and communities.",
    robots: { index: false, follow: true },
};

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const q = (searchParams.q || "").trim();
    const products = q
        ? await safe(() => listProducts({ query: q, first: 48 }), [])
        : [];

    return (
        <div className="bk-container py-10">
            <header className="mb-8">
                <span className="bk-kicker mb-2">Search</span>
                <h1 className="font-display text-display-sm text-ink">
                    {q ? `Results for "${q}"` : "Search BeeKL"}
                </h1>
                {q && (
                    <p className="mt-2 text-grey-500">
                        {products.length} {products.length === 1 ? "result" : "results"}
                    </p>
                )}
            </header>

            {!q ? (
                <div className="rounded-2xl border border-dashed border-grey-200 bg-paper-soft px-6 py-16 text-center">
                    <p className="text-grey-500">
                        Use the search bar in the header to find products, creators,
                        communities and drops.
                    </p>
                </div>
            ) : products.length ? (
                <ProductGrid products={products} />
            ) : (
                <NoResults query={q} />
            )}
        </div>
    );
}
