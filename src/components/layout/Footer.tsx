import Link from "next/link";
import type { FooterColumn, NavLink } from "@/lib/settings";
import {
    DEFAULT_FOOTER_COLUMNS,
    DEFAULT_SOCIALS,
} from "@/lib/settings";

/**
 * Premium, fully admin-customizable footer. Brand copy, link columns, social
 * links, newsletter toggle, note and copyright all come from SiteSettings.
 */
export function Footer({
    brandName = "BeeKL",
    description,
    tagline,
    note,
    copyright,
    newsletterEnabled = true,
    columns = DEFAULT_FOOTER_COLUMNS,
    socials = DEFAULT_SOCIALS,
}: {
    brandName?: string;
    description?: string;
    tagline?: string;
    note?: string;
    copyright?: string;
    newsletterEnabled?: boolean;
    columns?: FooterColumn[];
    socials?: NavLink[];
} = {}) {
    const cols = columns.length ? columns : DEFAULT_FOOTER_COLUMNS;
    const social = socials.length ? socials : DEFAULT_SOCIALS;
    const year = new Date().getFullYear();

    return (
        <footer className="mt-10 border-t border-white/10 bg-ink text-paper">
            <div className="bk-container py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link
                            href="/"
                            className="font-display text-3xl font-extrabold tracking-tight"
                        >
                            {renderBrand(brandName)}
                        </Link>
                        {description && (
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
                                {description}
                            </p>
                        )}
                        {tagline && (
                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-honey">
                                {tagline}
                            </p>
                        )}

                        {newsletterEnabled && (
                            <div className="mt-7 max-w-sm">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">
                                    Join the community
                                </p>
                                <div className="flex items-center gap-2 rounded-full border border-paper/20 p-1.5 transition-colors focus-within:border-paper/40">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        aria-label="Email"
                                        className="flex-1 bg-transparent px-3 text-sm text-paper placeholder:text-paper/40 focus:outline-none"
                                    />
                                    <Link
                                        href="/register"
                                        className="rounded-full bg-paper px-5 py-2 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-honey"
                                    >
                                        Join
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {cols.map((col) => (
                        <FooterCol key={col.title} title={col.title} links={col.links} />
                    ))}
                </div>

                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 md:flex-row">
                    <p className="text-xs text-paper/50">
                        © {year} {copyright || "BeeKL. All rights reserved."}
                    </p>
                    <div className="flex items-center gap-5">
                        {social.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noreferrer"
                                className="bk-underline text-xs font-semibold uppercase tracking-wide text-paper/60 hover:text-paper"
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>

                {note && (
                    <p className="mt-6 text-center text-[11px] leading-relaxed text-paper/40">
                        {note}
                    </p>
                )}
            </div>
        </footer>
    );
}

/** Render "BeeKL" with an accent on the last two letters; otherwise plain. */
function renderBrand(name: string) {
    if (name.toUpperCase() === "BEEKL") {
        return (
            <>
                BEE<span className="text-flame">KL</span>
            </>
        );
    }
    return name;
}

function FooterCol({ title, links }: { title: string; links: NavLink[] }) {
    return (
        <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
                {title}
            </h4>
            <ul className="space-y-2.5">
                {links.map((l) => (
                    <li key={`${l.label}-${l.href}`}>
                        <Link
                            href={l.href}
                            className="bk-underline text-sm text-paper/80 transition-colors hover:text-honey"
                        >
                            {l.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
