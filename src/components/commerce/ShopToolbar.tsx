"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { SORT_OPTIONS, SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Shop toolbar: result count + sort + basic filters (size, price, availability).
 * Filters are reflected in the URL query so pages remain server-rendered and
 * shareable. This is a real, working filter — it navigates with query params.
 */
export function ShopToolbar({ total }: { total: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const [open, setOpen] = React.useState(false);

    const currentSort = params.get("sort") || "recommended";

    function setParam(key: string, value: string | null) {
        const next = new URLSearchParams(params.toString());
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
        router.push(`${pathname}?${next.toString()}`);
    }

    const activeSize = params.get("size");
    const activeAvailability = params.get("availability");

    return (
        <div className="mb-6 border-b border-grey-200 pb-4">
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-grey-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-grey-100"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </button>

                <p className="hidden text-sm text-grey-500 sm:block">
                    {total} {total === 1 ? "product" : "products"}
                </p>

                <div className="relative">
                    <select
                        value={currentSort}
                        onChange={(e) => setParam("sort", e.target.value)}
                        className="h-10 appearance-none rounded-full border border-grey-200 bg-white pl-4 pr-9 text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                        aria-label="Sort products"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
                </div>
            </div>

            {open && (
                <div className="mt-4 grid gap-6 rounded-2xl border border-grey-200 bg-white p-5 sm:grid-cols-3 animate-fade-up">
                    {/* Size */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey-500">
                            Size
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SIZES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setParam("size", activeSize === s ? null : s)}
                                    className={cn(
                                        "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-bold",
                                        activeSize === s
                                            ? "border-ink bg-ink text-paper"
                                            : "border-grey-200 text-ink hover:border-ink"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey-500">
                            Price
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {[
                                { label: "Under ₹799", value: "0-799" },
                                { label: "₹799 – ₹1299", value: "799-1299" },
                                { label: "₹1299+", value: "1299-99999" },
                            ].map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() =>
                                        setParam("price", params.get("price") === p.value ? null : p.value)
                                    }
                                    className={cn(
                                        "text-left text-sm",
                                        params.get("price") === p.value
                                            ? "font-bold text-ink"
                                            : "text-grey-600 hover:text-ink"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey-500">
                            Availability
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <button
                                onClick={() =>
                                    setParam(
                                        "availability",
                                        activeAvailability === "in-stock" ? null : "in-stock"
                                    )
                                }
                                className={cn(
                                    "text-left text-sm",
                                    activeAvailability === "in-stock"
                                        ? "font-bold text-ink"
                                        : "text-grey-600 hover:text-ink"
                                )}
                            >
                                In stock only
                            </button>
                            <button
                                onClick={() => {
                                    const next = new URLSearchParams();
                                    const sort = params.get("sort");
                                    if (sort) next.set("sort", sort);
                                    router.push(`${pathname}?${next.toString()}`);
                                }}
                                className="text-left text-sm text-flame hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
