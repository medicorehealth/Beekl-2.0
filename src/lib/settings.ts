import "server-only";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";

/**
 * Site settings — the single source of truth for everything the admin can
 * customize (branding, theme accents, announcement bar, footer, socials,
 * homepage section visibility/copy). Backed by a singleton DB row but always
 * falls back to on-brand defaults so the site renders even with no DB/row.
 */

export type NavLink = { label: string; href: string };
export type FooterColumn = { title: string; links: NavLink[] };
export type HomeSection = {
    key: string;
    title: string;
    subtitle?: string;
    enabled: boolean;
    order: number;
};

export type SiteSettings = {
    brandName: string;
    tagline: string;
    description: string;
    logoUrl: string | null;
    accentHoney: string;
    accentFlame: string;
    announcementActive: boolean;
    announcementText: string;
    announcementItems: string[];
    heroAutoplayMs: number;
    footerDescription: string;
    footerTagline: string;
    footerNote: string;
    copyrightText: string;
    newsletterEnabled: boolean;
    footerColumns: FooterColumn[];
    socialLinks: NavLink[];
    homepageSections: HomeSection[];
};

/** Canonical homepage sections (order + default copy). */
export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
    { key: "categories", title: "Shop The Culture", subtitle: "Find your corner of the internet.", enabled: true, order: 0 },
    { key: "trending", title: "Trending Now", subtitle: "What the community is copping.", enabled: true, order: 1 },
    { key: "drops", title: "New Drops", subtitle: "Limited runs. Blink and they're gone.", enabled: true, order: 2 },
    { key: "memes", title: "Certified Meme Collection", subtitle: "Wearable chaos, community-approved.", enabled: true, order: 3 },
    { key: "popculture", title: "Pop Culture", subtitle: "Screen to street — where legal.", enabled: true, order: 4 },
    { key: "communities", title: "Creator Communities", subtitle: "The hubs making the clothes.", enabled: true, order: 5 },
    { key: "creators", title: "Creator Merchandise", subtitle: "Straight from the source.", enabled: true, order: 6 },
    { key: "contest", title: "You Have The Idea. We'll Make The Drop.", subtitle: "Submit → community votes → BeeKL produces the winner.", enabled: true, order: 7 },
    { key: "community_cta", title: "The Community Makes The Clothes.", subtitle: "Join BeeKL — build a community, drop merch, or just cop the fits.", enabled: true, order: 8 },
    { key: "social", title: "On The Feed", subtitle: "Tag @beekl to get featured.", enabled: true, order: 9 },
];

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
    {
        title: "Shop",
        links: [
            { label: "New Drops", href: "/drops" },
            { label: "Memes", href: "/memes" },
            { label: "Anime", href: "/anime" },
            { label: "Movies & TV", href: "/movies-tv" },
            { label: "Creator Merch", href: "/creators" },
            { label: "All Products", href: "/shop" },
        ],
    },
    {
        title: "Community",
        links: [
            { label: "Creators", href: "/creators" },
            { label: "Communities", href: "/communities" },
            { label: "Monthly Contest", href: "/contest" },
            { label: "Become a Creator", href: "/register?as=creator" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "Contact", href: "/contact" },
            { label: "Shipping Policy", href: "/shipping-policy" },
            { label: "Refund Policy", href: "/refund-policy" },
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy" },
        ],
    },
];

export const DEFAULT_SOCIALS: NavLink[] = [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "X", href: "https://x.com" },
];

export const DEFAULT_SETTINGS: SiteSettings = {
    brandName: "BeeKL",
    tagline: "The Community Makes The Clothes.",
    description:
        "Gen-Z fashion, creator merchandise, community-made drops and internet culture-inspired clothing.",
    logoUrl: null,
    accentHoney: "#FFC400",
    accentFlame: "#FF4D2E",
    announcementActive: true,
    announcementText: "FREE SHIPPING ON ORDERS ABOVE ₹999",
    announcementItems: [
        "THE COMMUNITY MAKES THE CLOTHES.",
        "NEW DROPS EVERY WEEK.",
        "CREATOR MERCH · MEMES · POP CULTURE",
    ],
    heroAutoplayMs: 6000,
    footerDescription:
        "Gen-Z fashion, creator merchandise, community-made drops and internet culture-inspired clothing.",
    footerTagline: "The Community Makes The Clothes.",
    footerNote:
        "BeeKL supports original and properly licensed designs only. Movie, anime and pop-culture merchandise is offered strictly where legally licensed.",
    copyrightText: "BeeKL. All rights reserved.",
    newsletterEnabled: true,
    footerColumns: DEFAULT_FOOTER_COLUMNS,
    socialLinks: DEFAULT_SOCIALS,
    homepageSections: DEFAULT_HOME_SECTIONS,
};

function coerceArray<T>(value: unknown, fallback: T): T {
    return Array.isArray(value) ? (value as unknown as T) : fallback;
}

/** Read the site settings singleton, merged over defaults. Never throws. */
export async function getSiteSettings(): Promise<SiteSettings> {
    const row = await safe(
        () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
        null
    );

    if (!row) return DEFAULT_SETTINGS;

    return {
        brandName: row.brandName ?? DEFAULT_SETTINGS.brandName,
        tagline: row.tagline ?? DEFAULT_SETTINGS.tagline,
        description: row.description ?? DEFAULT_SETTINGS.description,
        logoUrl: row.logoUrl ?? null,
        accentHoney: row.accentHoney ?? DEFAULT_SETTINGS.accentHoney,
        accentFlame: row.accentFlame ?? DEFAULT_SETTINGS.accentFlame,
        announcementActive: row.announcementActive,
        announcementText: row.announcementText ?? DEFAULT_SETTINGS.announcementText,
        announcementItems: coerceArray<string[]>(
            row.announcementItems,
            DEFAULT_SETTINGS.announcementItems
        ),
        heroAutoplayMs: row.heroAutoplayMs ?? DEFAULT_SETTINGS.heroAutoplayMs,
        footerDescription: row.footerDescription ?? DEFAULT_SETTINGS.footerDescription,
        footerTagline: row.footerTagline ?? DEFAULT_SETTINGS.footerTagline,
        footerNote: row.footerNote ?? DEFAULT_SETTINGS.footerNote,
        copyrightText: row.copyrightText ?? DEFAULT_SETTINGS.copyrightText,
        newsletterEnabled: row.newsletterEnabled,
        footerColumns: coerceArray<FooterColumn[]>(
            row.footerColumns,
            DEFAULT_SETTINGS.footerColumns
        ),
        socialLinks: coerceArray<NavLink[]>(row.socialLinks, DEFAULT_SETTINGS.socialLinks),
        homepageSections: mergeSections(
            coerceArray<HomeSection[]>(row.homepageSections, [])
        ),
    };
}

/** Ensure every known section exists (new sections appear even on old rows). */
function mergeSections(saved: HomeSection[]): HomeSection[] {
    if (!saved.length) return DEFAULT_HOME_SECTIONS;
    const byKey = new Map(saved.map((s) => [s.key, s]));
    const merged = DEFAULT_HOME_SECTIONS.map((def) => ({ ...def, ...byKey.get(def.key) }));
    return merged.sort((a, b) => a.order - b.order);
}

/** Convenience: is a homepage section enabled? */
export function sectionEnabled(settings: SiteSettings, key: string): boolean {
    const s = settings.homepageSections.find((x) => x.key === key);
    return s ? s.enabled : true;
}

/** Convenience: get a section's editable title/subtitle. */
export function sectionCopy(
    settings: SiteSettings,
    key: string,
    fallbackTitle: string,
    fallbackSubtitle?: string
): { title: string; subtitle?: string } {
    const s = settings.homepageSections.find((x) => x.key === key);
    return {
        title: s?.title || fallbackTitle,
        subtitle: s?.subtitle ?? fallbackSubtitle,
    };
}
