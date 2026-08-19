"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { debounce, formatINR } from "@/lib/utils";

type Results = {
    products: { handle: string; title: string; image: string | null; price: number | null }[];
    creators: { handle: string; displayName: string; avatarImage: string | null }[];
    communities: { slug: string; name: string }[];
    collections: { slug: string; title: string }[];
    drops: { slug: string; name: string; status: string }[];
};

const EMPTY: Results = {
    products: [],
    creators: [],
    communities: [],
    collections: [],
    drops: [],
};

export function SearchDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<Results>(EMPTY);
    const [loading, setLoading] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = "hidden";
        } else {
            setQuery("");
            setResults(EMPTY);
            document.body.style.overflow = "";
        }
    }, [open]);

    // Debounced search
    const runSearch = React.useMemo(
        () =>
            debounce(async (q: string) => {
                if (q.trim().length < 2) {
                    setResults(EMPTY);
                    setLoading(false);
                    return;
                }
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
                    const data = await res.json();
                    setResults(data);
                } catch {
                    setResults(EMPTY);
                } finally {
                    setLoading(false);
                }
            }, 300),
        []
    );

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value;
        setQuery(v);
        setLoading(v.trim().length >= 2);
        runSearch(v);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            onClose();
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    }

    const hasResults =
        results.products.length ||
        results.creators.length ||
        results.communities.length ||
        results.collections.length ||
        results.drops.length;

    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[95]">
            <div className="absolute inset-0 bg-ink/60 animate-fade-in" onClick={onClose} />
            <div className="relative mx-auto mt-0 w-full max-w-2xl animate-fade-up bg-white shadow-lift sm:mt-20 sm:rounded-2xl">
                <form onSubmit={submit} className="flex items-center gap-3 border-b border-grey-100 px-5 py-4">
                    <SearchIcon className="h-5 w-5 text-grey-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={onChange}
                        placeholder="Search products, creators, drops…"
                        className="flex-1 bg-transparent text-base text-ink placeholder:text-grey-400 focus:outline-none"
                    />
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-grey-400" />}
                    <button type="button" onClick={onClose} aria-label="Close search">
                        <X className="h-5 w-5 text-grey-400 hover:text-ink" />
                    </button>
                </form>

                <div className="max-h-[60vh] overflow-y-auto p-3">
                    {query.trim().length < 2 ? (
                        <p className="px-3 py-8 text-center text-sm text-grey-400">
                            Type at least 2 characters to search.
                        </p>
                    ) : !hasResults && !loading ? (
                        <p className="px-3 py-8 text-center text-sm text-grey-400">
                            No results for &ldquo;{query}&rdquo;.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {results.products.length > 0 && (
                                <Section title="Products">
                                    {results.products.map((p) => (
                                        <Link
                                            key={p.handle}
                                            href={`/products/${p.handle}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-xl p-2 hover:bg-paper-soft"
                                        >
                                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-grey-100">
                                                {p.image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <span className="flex-1 text-sm font-medium text-ink">{p.title}</span>
                                            {p.price != null && (
                                                <span className="text-sm font-bold text-ink">{formatINR(p.price)}</span>
                                            )}
                                        </Link>
                                    ))}
                                </Section>
                            )}
                            {results.creators.length > 0 && (
                                <Section title="Creators">
                                    {results.creators.map((c) => (
                                        <Link key={c.handle} href={`/creators/${c.handle}`} onClick={onClose} className="block rounded-xl p-2 text-sm hover:bg-paper-soft">
                                            {c.displayName} <span className="text-grey-400">@{c.handle}</span>
                                        </Link>
                                    ))}
                                </Section>
                            )}
                            {results.communities.length > 0 && (
                                <Section title="Communities">
                                    {results.communities.map((c) => (
                                        <Link key={c.slug} href={`/communities/${c.slug}`} onClick={onClose} className="block rounded-xl p-2 text-sm hover:bg-paper-soft">
                                            {c.name}
                                        </Link>
                                    ))}
                                </Section>
                            )}
                            {results.drops.length > 0 && (
                                <Section title="Drops">
                                    {results.drops.map((d) => (
                                        <Link key={d.slug} href={`/drops/${d.slug}`} onClick={onClose} className="block rounded-xl p-2 text-sm hover:bg-paper-soft">
                                            {d.name} <span className="text-grey-400">· {d.status}</span>
                                        </Link>
                                    ))}
                                </Section>
                            )}
                            {results.collections.length > 0 && (
                                <Section title="Collections">
                                    {results.collections.map((c) => (
                                        <Link key={c.slug} href={`/collections/${c.slug}`} onClick={onClose} className="block rounded-xl p-2 text-sm hover:bg-paper-soft">
                                            {c.title}
                                        </Link>
                                    ))}
                                </Section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-grey-400">
                {title}
            </p>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}
