import type { BeeklProduct } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { NoResults } from "@/components/ui/States";

export function ProductGrid({
    products,
    emptyQuery,
}: {
    products: BeeklProduct[];
    emptyQuery?: string;
}) {
    if (!products.length) {
        return <NoResults query={emptyQuery} />;
    }
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
