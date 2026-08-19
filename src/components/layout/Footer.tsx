import Link from "next/link";
import { FOOTER_LINKS, SITE, SOCIALS } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="mt-10 border-t border-grey-200 bg-ink text-paper">
            <div className="bk-container py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="font-display text-3xl font-extrabold">
                            BEE<span className="text-flame">KL</span>
                        </Link>
                        <p className="mt-3 max-w-xs text-sm text-paper/60">
                            {SITE.description}
                        </p>
                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-honey">
                            {SITE.tagline}
                        </p>

                        {/* Newsletter (non-fake: posts nowhere until wired, so it's a link to register) */}
                        <div className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-paper/20 p-1.5">
                            <input
                                type="email"
                                placeholder="Your email"
                                aria-label="Email"
                                className="flex-1 bg-transparent px-3 text-sm text-paper placeholder:text-paper/40 focus:outline-none"
                            />
                            <Link
                                href="/register"
                                className="rounded-full bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink hover:bg-honey"
                            >
                                Join
                            </Link>
                        </div>
                    </div>

                    <FooterCol title="Shop" links={FOOTER_LINKS.shop} />
                    <FooterCol title="Community" links={FOOTER_LINKS.community} />
                    <FooterCol title="Help" links={FOOTER_LINKS.help} />
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-6 md:flex-row">
                    <p className="text-xs text-paper/50">
                        © {new Date().getFullYear()} BeeKL. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {SOCIALS.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold uppercase tracking-wide text-paper/60 hover:text-paper"
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>

                <p className="mt-6 text-center text-[11px] leading-relaxed text-paper/40">
                    BeeKL supports original and properly licensed designs only. Movie,
                    anime and pop-culture merchandise is offered strictly where legally
                    licensed.
                </p>
            </div>
        </footer>
    );
}

function FooterCol({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}) {
    return (
        <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
                {title}
            </h4>
            <ul className="space-y-2.5">
                {links.map((l) => (
                    <li key={l.label}>
                        <Link
                            href={l.href}
                            className="text-sm text-paper/80 transition-colors hover:text-honey"
                        >
                            {l.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
