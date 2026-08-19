import "server-only";
import { prisma } from "@/lib/db";
import type { HeroSlide } from "@/components/layout/HeroCarousel";

/**
 * Content/CMS helpers. Banners and featured sections are DB-driven so the admin
 * can change them without code edits. When the DB has no active banners we fall
 * back to on-brand default slides so the homepage is never broken/empty.
 */

const DEFAULT_SLIDES: HeroSlide[] = [
    {
        id: "default-1",
        title: "THE INTERNET GOT DRESSED.",
        subtitle: "Gen-Z drops. Community-made designs. Limited quantities.",
        desktopImage:
            "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80",
        mobileImage:
            "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80",
        primaryButtonText: "Shop Now",
        primaryButtonLink: "/shop",
        secondaryButtonText: "Explore Drops",
        secondaryButtonLink: "/drops",
    },
    {
        id: "default-2",
        title: "YOUR MEME. YOUR MERCH.",
        subtitle: "Got an idea? Turn it into something you can actually wear.",
        desktopImage:
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80",
        mobileImage:
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
        primaryButtonText: "Submit Your Idea",
        primaryButtonLink: "/contest",
        secondaryButtonText: "See the Memes",
        secondaryButtonLink: "/memes",
    },
    {
        id: "default-3",
        title: "CREATORS. COMMUNITIES. DROPS.",
        subtitle: "The community makes the clothes — literally.",
        desktopImage:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
        mobileImage:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        primaryButtonText: "Explore Communities",
        primaryButtonLink: "/communities",
        secondaryButtonText: "Meet Creators",
        secondaryButtonLink: "/creators",
    },
];

/** Get active, in-window, ordered banners as hero slides. Falls back to defaults. */
export async function getActiveBanners(): Promise<{
    slides: HeroSlide[];
    isDefault: boolean;
}> {
    const now = new Date();
    const banners = await prisma.banner.findMany({
        where: {
            isActive: true,
            AND: [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] },
            ],
        },
        orderBy: { displayOrder: "asc" },
    });

    if (banners.length === 0) {
        return { slides: DEFAULT_SLIDES, isDefault: true };
    }

    return {
        slides: banners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            desktopImage: b.desktopImage,
            mobileImage: b.mobileImage,
            primaryButtonText: b.primaryButtonText,
            primaryButtonLink: b.primaryButtonLink,
            secondaryButtonText: b.secondaryButtonText,
            secondaryButtonLink: b.secondaryButtonLink,
        })),
        isDefault: false,
    };
}

/** Featured collections for the homepage. */
export async function getFeaturedCollections() {
    return prisma.collectionRef.findMany({
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
        take: 8,
    });
}

/** Featured creators (approved/featured). */
export async function getFeaturedCreators() {
    return prisma.creator.findMany({
        where: { status: { in: ["APPROVED", "FEATURED"] } },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
        include: { _count: { select: { products: true } } },
    });
}

/** Featured communities (approved/featured). */
export async function getFeaturedCommunities() {
    return prisma.community.findMany({
        where: { status: { in: ["APPROVED", "FEATURED"] } },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 6,
        include: {
            creator: { select: { displayName: true } },
            _count: { select: { members: true } },
        },
    });
}

/** Live/upcoming drops for the homepage + drops page. */
export async function getActiveDrops() {
    return prisma.drop.findMany({
        where: { status: { in: ["LIVE", "UPCOMING"] } },
        orderBy: [{ isFeatured: "desc" }, { releaseAt: "asc" }],
        take: 8,
        include: { creator: { select: { displayName: true } } },
    });
}

/** The current contest (open/voting), if any. */
export async function getCurrentContest() {
    return prisma.contest.findFirst({
        where: { status: { in: ["OPEN", "VOTING", "JUDGING"] } },
        orderBy: { startAt: "desc" },
    });
}
