import Link from "next/link";
import { ArrowRight, Sparkles, Palette, Trophy } from "lucide-react";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import {
    CategoryCard,
    CollectionCard,
    CreatorCard,
    CommunityCard,
    DropCard,
    ContestCard,
} from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { ButtonLink } from "@/components/ui/Button";
import { CATEGORY_CARDS } from "@/lib/constants";
import { safe } from "@/lib/safe";
import { listProducts } from "@/lib/catalog";
import {
    getActiveBanners,
    getFeaturedCollections,
    getFeaturedCreators,
    getFeaturedCommunities,
    getActiveDrops,
    getCurrentContest,
} from "@/lib/content";
import { getSiteSettings, sectionEnabled, sectionCopy } from "@/lib/settings";

export const revalidate = 60;

export default async function HomePage() {
    // All data fetched safely so the homepage never hard-crashes.
    const [{ slides }, trending, collections, creators, communities, drops, contest, settings] =
        await Promise.all([
            safe(() => getActiveBanners(), { slides: [], isDefault: true }),
            safe(() => listProducts({ first: 8, sortKey: "BEST_SELLING" }), []),
            safe(() => getFeaturedCollections(), []),
            safe(() => getFeaturedCreators(), []),
            safe(() => getFeaturedCommunities(), []),
            safe(() => getActiveDrops(), []),
            safe(() => getCurrentContest(), null),
            getSiteSettings(),
        ]);

    const memeProducts = await safe(() => listProducts({ first: 4, tag: "meme" }), []);

    // Admin-editable section visibility + copy.
    const on = (key: string) => sectionEnabled(settings, key);
    const copy = (key: string, t: string, s?: string) => sectionCopy(settings, key, t, s);
    const socials = settings.socialLinks;

    const cat = copy("categories", "Find your fit", "Shop the Culture");
    const trend = copy("trending", "Trending", "Hot right now");
    const dropCopy = copy("drops", "New Drops", "Blink and it's gone");
    const memeCopy = copy("memes", "Wearable chaos.", "Certified Unserious");
    const popCopy = copy("popculture", "Pop Culture", "Screen to street");
    const commCopy = copy("communities", "Creator Communities", "The community makes the clothes");
    const contestCopy = copy("contest", "You have the idea. We'll make the drop.", "Monthly contest");
    const social = copy("social", "Tag us. Get seen. Maybe get merch.", "@beekl");

    return (
        <>
            {/* 3. Hero slider (auto-sliding; interval is admin-configurable) */}
            <HeroCarousel slides={slides} autoplayMs={settings.heroAutoplayMs} />

            {/* Brand marquee — signature streetwear strip */}
            <div className="border-y border-ink bg-ink py-3 text-paper">
                <div className="flex overflow-hidden">
                    <div className="bk-marquee gap-6">
                        {Array.from({ length: 2 }).flatMap((_, r) =>
                            [
                                "THE COMMUNITY MAKES THE CLOTHES",
                                "MEME CULTURE",
                                "CREATOR DROPS",
                                "LIMITED RUNS",
                                "MADE IN INDIA",
                                "WEAR THE INTERNET",
                            ].map((t, i) => (
                                <span
                                    key={`${r}-${i}`}
                                    className="flex items-center gap-6 font-display text-lg font-bold uppercase tracking-tight"
                                >
                                    {t}
                                    <span className="text-honey">✦</span>
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Shop by category */}

            {on("categories") && (
                <section className="bk-section">
                    <div className="bk-container">
                        <SectionHeader kicker={cat.subtitle} title={cat.title} href="/shop" />
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {CATEGORY_CARDS.map((c) => (
                                <CategoryCard key={c.label} {...c} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Trending products */}
            {on("trending") && (
                <section className="bk-section bg-paper-soft">
                    <div className="bk-container">
                        <SectionHeader kicker={trend.subtitle} title={trend.title} href="/shop" />
                        {trending.length ? (
                            <ProductGrid products={trending} />
                        ) : (
                            <EmptyState
                                title="No products yet."
                                description="Connect a database & seed demo data to see products here."
                                action={{ label: "Explore drops", href: "/drops" }}
                            />
                        )}
                    </div>
                </section>
            )}

            {/* 6. New drops */}
            {on("drops") && (
                <section className="bk-section">
                    <div className="bk-container">
                        <SectionHeader kicker={dropCopy.subtitle} title={dropCopy.title} href="/drops" />
                        {drops.length ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {drops.slice(0, 4).map((d) => (
                                    <DropCard
                                        key={d.id}
                                        slug={d.slug}
                                        name={d.name}
                                        status={d.status}
                                        bannerImage={d.bannerImage}
                                        releaseAt={d.releaseAt}
                                        creatorName={d.creator?.displayName ?? null}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="No drops yet." description="New limited drops will appear here." />
                        )}
                    </div>
                </section>
            )}

            {/* 7. Meme collection */}
            {on("memes") && (
                <section className="bk-section bg-ink text-paper">
                    <div className="bk-container">
                        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <span className="bk-kicker mb-2 text-honey">{memeCopy.subtitle}</span>
                                <h2 className="font-display text-display-sm text-paper">{memeCopy.title}</h2>
                                <p className="mt-2 max-w-md text-paper/60">
                                    The memes you send at 2am, now on a tee. Original and
                                    community-made — never stolen art.
                                </p>
                            </div>
                            <ButtonLink href="/memes" variant="accent">
                                Shop Memes
                            </ButtonLink>
                        </div>
                        {memeProducts.length ? (
                            <ProductGrid products={memeProducts} />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-paper/20 p-10 text-center text-paper/60">
                                Meme collection coming soon.
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 8. Pop culture */}
            {on("popculture") && (
                <section className="bk-section">
                    <div className="bk-container">
                        <SectionHeader kicker={popCopy.subtitle} title={popCopy.title} />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <PopCard
                                href="/anime"
                                title="Anime"
                                blurb="For the culture. Licensed & original."
                                image="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&q=80"
                            />
                            <PopCard
                                href="/movies-tv"
                                title="Movies & TV"
                                blurb="Iconic scenes, legally licensed."
                                image="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000&q=80"
                            />
                            <PopCard
                                href="/collections/beekl-originals"
                                title="BeeKL Originals"
                                blurb="Our own in-house line."
                                image="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&q=80"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* 9 + 10. Creator communities & merchandise */}
            {on("communities") && (
                <section className="bk-section bg-paper-soft">
                    <div className="bk-container">
                        <SectionHeader kicker={commCopy.subtitle} title={commCopy.title} href="/communities" />
                        {communities.length ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {communities.slice(0, 3).map((c) => (
                                    <CommunityCard
                                        key={c.id}
                                        slug={c.slug}
                                        name={c.name}
                                        description={c.description}
                                        bannerImage={c.bannerImage}
                                        memberCount={c._count.members}
                                        creatorName={c.creator.displayName}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No communities yet."
                                description="Creators are building. Check back soon."
                                action={{ label: "Become a creator", href: "/register?as=creator" }}
                            />
                        )}

                        {on("creators") && creators.length > 0 && (
                            <div className="mt-12">
                                <SectionHeader kicker="Straight from the source" title="Creator Merch" href="/creators" />
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {creators.slice(0, 4).map((cr) => (
                                        <CreatorCard
                                            key={cr.id}
                                            handle={cr.handle}
                                            displayName={cr.displayName}
                                            avatarImage={cr.avatarImage}
                                            bannerImage={cr.bannerImage}
                                            isFeatured={cr.isFeatured}
                                            productCount={cr._count.products}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 11. Contest */}
            {on("contest") && (
                <section className="bk-section">
                    <div className="bk-container">
                        {contest ? (
                            <div className="grid items-stretch gap-4 lg:grid-cols-2">
                                <ContestCard
                                    slug={contest.slug}
                                    title={contest.title}
                                    tagline={contest.tagline}
                                    status={contest.status}
                                    bannerImage={contest.bannerImage}
                                    endAt={contest.endAt}
                                />
                                <div className="flex flex-col justify-center rounded-3xl border border-grey-200 bg-white p-8">
                                    <Trophy className="mb-4 h-8 w-8 text-honey" />
                                    <h2 className="font-display text-3xl font-bold text-ink">
                                        {contestCopy.title}
                                    </h2>
                                    <p className="mt-3 text-grey-600">
                                        Submit → community votes → BeeKL selects → your design
                                        becomes a real limited drop. Winner gets the configured reward.
                                    </p>
                                    <ButtonLink href="/contest" className="mt-6 self-start">
                                        Enter the contest
                                    </ButtonLink>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-flame p-8 text-white md:p-12">
                                <Trophy className="mb-4 h-8 w-8" />
                                <h2 className="font-display text-display-sm max-w-2xl">
                                    {contestCopy.title}
                                </h2>
                                <p className="mt-3 max-w-lg text-white/80">
                                    Our monthly contest turns community ideas into real limited
                                    drops. No contest is live right now — follow along and be ready.
                                </p>
                                <ButtonLink href="/contest" variant="secondary" className="mt-6">
                                    See how it works
                                </ButtonLink>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Featured collections */}
            {collections.length > 0 && (
                <section className="bk-section bg-paper-soft">
                    <div className="bk-container">
                        <SectionHeader kicker="Curated" title="Collections" href="/collections" />
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {collections.slice(0, 4).map((c) => (
                                <CollectionCard
                                    key={c.id}
                                    slug={c.slug}
                                    title={c.title}
                                    image={c.heroImage}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 12. Community CTA */}
            {on("community_cta") && (
                <section className="bk-section">
                    <div className="bk-container">
                        <div className="grid gap-4 md:grid-cols-2">
                            <CtaCard
                                icon={<Palette className="h-7 w-7" />}
                                title="Start a community"
                                body="Turn your audience into a brand. Launch merch with zero inventory risk — BeeKL handles printing, shipping and payouts."
                                href="/register?as=creator"
                                label="Become a Creator"
                            />
                            <CtaCard
                                icon={<Sparkles className="h-7 w-7" />}
                                title="Submit an idea"
                                body="Got a design in your head? Drop it into the contest. If the community loves it, we'll make it real."
                                href="/contest"
                                label="Submit Your Idea"
                                dark
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* 13. Social section */}
            {on("social") && (
                <section className="bk-section bg-ink text-paper">
                    <div className="bk-container text-center">
                        <span className="bk-kicker mb-3 justify-center text-honey">{social.subtitle}</span>
                        <h2 className="font-display text-display-sm text-paper">{social.title}</h2>
                        <p className="mx-auto mt-3 max-w-md text-paper/60">
                            We repost the best community fits. The internet is the runway.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full border border-paper/30 px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-paper hover:text-ink"
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

function PopCard({
    href,
    title,
    blurb,
    image,
}: {
    href: string;
    title: string;
    blurb: string;
    image: string;
}) {
    return (
        <Link
            href={href}
            className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-3xl bg-ink"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={image}
                alt={title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
            <div className="relative z-10 p-6">
                <h3 className="font-display text-2xl font-bold text-paper">{title}</h3>
                <p className="mt-1 text-sm text-paper/70">{blurb}</p>
            </div>
        </Link>
    );
}

function CtaCard({
    icon,
    title,
    body,
    href,
    label,
    dark,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
    href: string;
    label: string;
    dark?: boolean;
}) {
    return (
        <div
            className={
                "flex flex-col justify-between rounded-3xl p-8 " +
                (dark ? "bg-ink text-paper" : "border border-grey-200 bg-white text-ink")
            }
        >
            <div>
                <div className={dark ? "text-honey" : "text-flame"}>{icon}</div>
                <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
                <p className={"mt-2 text-sm " + (dark ? "text-paper/70" : "text-grey-600")}>
                    {body}
                </p>
            </div>
            <Link
                href={href}
                className={
                    "group mt-6 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide " +
                    (dark ? "text-honey" : "text-ink hover:text-flame")
                }
            >
                {label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
