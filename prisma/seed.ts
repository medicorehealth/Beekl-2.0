/**
 * BeeKL — Development Seed Data
 * =============================================================================
 * ⚠️ THIS IS DEVELOPMENT / DEMO DATA ONLY.
 * It is clearly separated from production and must NOT be treated as real
 * production analytics or sales. Run with: `npm run db:seed`.
 *
 * Creates: permissions, an admin + super admin + demo creators + customers,
 * communities, collections, drops, products, a live contest with submissions,
 * and homepage banners.
 * =============================================================================
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSION_KEYS = [
    "admin.access",
    "products.view",
    "products.manage",
    "orders.view",
    "orders.manage",
    "customers.view",
    "customers.manage",
    "creators.view",
    "creators.manage",
    "communities.view",
    "communities.manage",
    "submissions.view",
    "submissions.moderate",
    "contests.view",
    "contests.manage",
    "drops.view",
    "drops.manage",
    "fulfillment.view",
    "fulfillment.manage",
    "returns.manage",
    "commissions.view",
    "commissions.manage",
    "payouts.view",
    "payouts.manage",
    "banners.manage",
    "homepage.manage",
    "analytics.view",
    "settings.manage",
];

async function main() {
    console.log("🐝 Seeding BeeKL development data…");

    // --- Permissions --------------------------------------------------------
    for (const key of PERMISSION_KEYS) {
        await prisma.permission.upsert({
            where: { key },
            create: { key, description: `Permission: ${key}` },
            update: {},
        });
    }

    const password = await bcrypt.hash("password123", 12);

    // Dedicated admin credentials (separate, stronger password).
    const adminPassword = await bcrypt.hash("@beekladmin007#", 12);

    // --- Users --------------------------------------------------------------
    const superAdmin = await prisma.user.upsert({
        where: { email: "admin@beekl007.com" },
        create: {
            email: "admin@beekl007.com",
            name: "BeeKL Admin",
            passwordHash: adminPassword,
            role: "SUPER_ADMIN",
        },
        // Re-seeding always restores the SUPER_ADMIN role + latest password.
        update: { role: "SUPER_ADMIN", passwordHash: adminPassword, isActive: true },
    });


    await prisma.user.upsert({
        where: { email: "finance@beekl.dev" },
        create: {
            email: "finance@beekl.dev",
            name: "Finance Team",
            passwordHash: password,
            role: "FINANCE",
        },
        update: {},
    });

    const customer = await prisma.user.upsert({
        where: { email: "customer@beekl.dev" },
        create: {
            email: "customer@beekl.dev",
            name: "Aarav Shopper",
            passwordHash: password,
            role: "CUSTOMER",
        },
        update: {},
    });

    // --- Creators + communities --------------------------------------------
    const creatorsData = [
        {
            email: "riya@beekl.dev",
            name: "Riya Kapoor",
            handle: "riyamakes",
            displayName: "Riya Makes",
            bio: "Turning group-chat jokes into fits since forever. Delhi-based, chronically online.",
            community: { slug: "delulu-club", name: "The Delulu Club", description: "For the delusional and proud. Manifesting merch." },
            featured: true,
        },
        {
            email: "arjun@beekl.dev",
            name: "Arjun Mehta",
            handle: "arjundraws",
            displayName: "Arjun Draws",
            bio: "Illustrator. Anime nerd. I put my original characters on tees.",
            community: { slug: "inkwell", name: "Inkwell Society", description: "Original anime-style art, zero bootlegs." },
            featured: true,
        },
        {
            email: "sana@beekl.dev",
            name: "Sana Rao",
            handle: "sanasaysso",
            displayName: "Sana Says So",
            bio: "Pop-culture commentary you can wear. Movies, shows, and hot takes.",
            community: { slug: "the-rewatch", name: "The Rewatch", description: "Screen-to-street fits for people who never stopped quoting." },
            featured: false,
        },
    ];

    const creators = [];
    for (const c of creatorsData) {
        const user = await prisma.user.upsert({
            where: { email: c.email },
            create: { email: c.email, name: c.name, passwordHash: password, role: "CREATOR" },
            update: { role: "CREATOR" },
        });

        const creator = await prisma.creator.upsert({
            where: { handle: c.handle },
            create: {
                userId: user.id,
                handle: c.handle,
                displayName: c.displayName,
                bio: c.bio,
                status: c.featured ? "FEATURED" : "APPROVED",
                isFeatured: c.featured,
                commissionRateBps: 1500,
                socialLinks: { instagram: "https://instagram.com", website: "https://example.com" },
            },
            update: {},
        });

        const community = await prisma.community.upsert({
            where: { slug: c.community.slug },
            create: {
                creatorId: creator.id,
                slug: c.community.slug,
                name: c.community.name,
                description: c.community.description,
                status: c.featured ? "FEATURED" : "APPROVED",
                isFeatured: c.featured,
            },
            update: {},
        });

        creators.push({ creator, community });
    }

    // Customer joins the first community.
    await prisma.communityMember.upsert({
        where: {
            communityId_userId: {
                communityId: creators[0].community.id,
                userId: customer.id,
            },
        },
        create: { communityId: creators[0].community.id, userId: customer.id },
        update: {},
    });

    // --- Collections --------------------------------------------------------
    const collectionsData = [
        { slug: "tees", title: "T-Shirts", kind: "GENERIC", featured: true },
        { slug: "oversized", title: "Oversized", kind: "OVERSIZED", featured: true },
        { slug: "hoodies", title: "Hoodies", kind: "HOODIES", featured: true },
        { slug: "memes", title: "Memes", kind: "MEMES", featured: true },
        { slug: "anime", title: "Anime", kind: "ANIME", featured: false },
        { slug: "movies-tv", title: "Movies & TV", kind: "MOVIES_TV", featured: false },
        { slug: "beekl-originals", title: "BeeKL Originals", kind: "BEEKL_ORIGINALS", featured: true },
        { slug: "limited-drops", title: "Limited Drops", kind: "LIMITED_DROPS", featured: false },
    ] as const;

    const collections: Record<string, string> = {};
    for (let i = 0; i < collectionsData.length; i++) {
        const c = collectionsData[i];
        const col = await prisma.collectionRef.upsert({
            where: { slug: c.slug },
            create: {
                slug: c.slug,
                title: c.title,
                kind: c.kind as never,
                isFeatured: c.featured,
                displayOrder: i,
                heroImage:
                    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1000&q=80",
            },
            update: {},
        });
        collections[c.slug] = col.id;
    }

    // --- Drops --------------------------------------------------------------
    const dropData = [
        { slug: "delulu-season-1", name: "Delulu: Season 1", status: "LIVE", creatorIdx: 0, featured: true },
        { slug: "inkwell-vol-1", name: "Inkwell Vol.1", status: "UPCOMING", creatorIdx: 1, featured: true },
        { slug: "rewatch-classics", name: "Rewatch Classics", status: "ENDED", creatorIdx: 2, featured: false },
    ] as const;

    const drops: Record<string, string> = {};
    for (const d of dropData) {
        const { creator, community } = creators[d.creatorIdx];
        const drop = await prisma.drop.upsert({
            where: { slug: d.slug },
            create: {
                slug: d.slug,
                name: d.name,
                story: `A limited drop from ${creator.displayName}. Small batch, big feelings.`,
                status: d.status as never,
                isFeatured: d.featured,
                creatorId: creator.id,
                communityId: community.id,
                bannerImage:
                    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
                releaseAt:
                    d.status === "UPCOMING"
                        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
                        : new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            },
            update: {},
        });
        drops[d.slug] = drop.id;
    }

    // --- Products (references — commerce data comes from Shopify in prod) ----
    const productData = [
        { handle: "delulu-is-the-solulu-tee", title: "Delulu Is The Solulu Tee", creatorIdx: 0, collection: "memes", drop: "delulu-season-1", tags: ["meme", "tees"] },
        { handle: "manifesting-oversized", title: "Manifesting (Oversized)", creatorIdx: 0, collection: "oversized", drop: "delulu-season-1", tags: ["meme", "oversized"] },
        { handle: "touch-grass-hoodie", title: "Touch Grass Hoodie", creatorIdx: 0, collection: "hoodies", tags: ["meme", "hoodies"] },
        { handle: "ronin-original-tee", title: "Ronin (Original Character) Tee", creatorIdx: 1, collection: "anime", drop: "inkwell-vol-1", tags: ["anime", "tees"] },
        { handle: "inkwell-oversized-anime", title: "Inkwell Oversized", creatorIdx: 1, collection: "oversized", tags: ["anime", "oversized"] },
        { handle: "spirit-fox-hoodie", title: "Spirit Fox Hoodie", creatorIdx: 1, collection: "hoodies", tags: ["anime", "hoodies"] },
        { handle: "one-more-episode-tee", title: "One More Episode Tee", creatorIdx: 2, collection: "movies-tv", tags: ["movies-tv", "tees"] },
        { handle: "plot-twist-oversized", title: "Plot Twist (Oversized)", creatorIdx: 2, collection: "movies-tv", tags: ["movies-tv", "oversized"] },
        { handle: "beekl-og-logo-tee", title: "BeeKL OG Logo Tee", creatorIdx: 0, collection: "beekl-originals", tags: ["beekl", "tees"] },
        { handle: "the-internet-got-dressed-tee", title: "The Internet Got Dressed Tee", creatorIdx: 1, collection: "beekl-originals", tags: ["beekl", "tees"] },
        { handle: "wearable-chaos-tee", title: "Wearable Chaos Tee", creatorIdx: 2, collection: "memes", tags: ["meme", "tees"] },
        { handle: "certified-unserious-hoodie", title: "Certified Unserious Hoodie", creatorIdx: 0, collection: "hoodies", tags: ["meme", "hoodies"] },
    ];

    for (const p of productData) {
        const { creator, community } = creators[p.creatorIdx];
        await prisma.productReference.upsert({
            where: { handle: p.handle },
            create: {
                handle: p.handle,
                title: p.title,
                status: "ACTIVE",
                source: "MANUAL",
                story:
                    "Born in a group chat, refined by the community, made real by BeeKL. This one's got main-character energy.",
                whyThisExists:
                    "Because the feeling deserved a fit. Original, community-approved, and printed responsibly.",
                tags: p.tags,
                creatorId: creator.id,
                communityId: community.id,
                collectionId: collections[p.collection],
                dropId: p.drop ? drops[p.drop] : null,
            },
            update: {},
        });
    }

    // --- Contest ------------------------------------------------------------
    const contest = await prisma.contest.upsert({
        where: { slug: "monthly-drop-contest" },
        create: {
            slug: "monthly-drop-contest",
            title: "You Have The Idea. We'll Make The Drop.",
            tagline: "This month's theme: Chronically Online.",
            description: "Submit your best internet-culture design idea. Community votes, BeeKL produces the winner.",
            rules: "Original work only. No copyrighted characters or logos. Keep it wearable. Max 3 entries per person.",
            prize: "₹25,000 + 20% royalties on the drop",
            status: "OPEN",
            submissionLimitPerUser: 3,
            startAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
            votingEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 17),
            bannerImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
        },
        update: {},
    });

    const existingEntries = await prisma.contestSubmission.count({ where: { contestId: contest.id } });
    if (existingEntries === 0) {
        await prisma.contestSubmission.createMany({
            data: [
                { contestId: contest.id, userId: customer.id, title: "'Reply Guy' Tee", description: "For the ones always in the comments.", voteCount: 12 },
                { contestId: contest.id, userId: creators[0].creator.userId, title: "'Main Character' Hoodie", description: "POV: it's your story.", voteCount: 28 },
                { contestId: contest.id, userId: creators[1].creator.userId, title: "'Low Battery, High Vibes'", description: "1% but thriving.", voteCount: 19 },
            ],
        });
    }

    // --- Banners ------------------------------------------------------------
    const bannerCount = await prisma.banner.count();
    if (bannerCount === 0) {
        await prisma.banner.createMany({
            data: [
                {
                    title: "THE INTERNET GOT DRESSED.",
                    subtitle: "Gen-Z drops. Community-made designs. Limited quantities.",
                    desktopImage: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80",
                    mobileImage: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80",
                    primaryButtonText: "Shop Now",
                    primaryButtonLink: "/shop",
                    secondaryButtonText: "Explore Drops",
                    secondaryButtonLink: "/drops",
                    displayOrder: 0,
                    isActive: true,
                },
                {
                    title: "YOUR MEME. YOUR MERCH.",
                    subtitle: "Got an idea? Turn it into something you can actually wear.",
                    desktopImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80",
                    mobileImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
                    primaryButtonText: "Submit Your Idea",
                    primaryButtonLink: "/contest",
                    secondaryButtonText: "See the Memes",
                    secondaryButtonLink: "/memes",
                    displayOrder: 1,
                    isActive: true,
                },
                {
                    title: "CREATORS. COMMUNITIES. DROPS.",
                    subtitle: "The community makes the clothes — literally.",
                    desktopImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
                    mobileImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
                    primaryButtonText: "Explore Communities",
                    primaryButtonLink: "/communities",
                    secondaryButtonText: "Meet Creators",
                    secondaryButtonLink: "/creators",
                    displayOrder: 2,
                    isActive: true,
                },
            ],
        });
    }

    console.log("✅ Seed complete.");
    console.log("");
    console.log("   ADMIN login:");
    console.log("   • admin@beekl007.com  /  @beekladmin007#   (SUPER_ADMIN)");
    console.log("");
    console.log("   Other demo logins (password: password123):");
    console.log("   • finance@beekl.dev   (FINANCE)");
    console.log("   • riya@beekl.dev      (CREATOR, featured)");
    console.log("   • customer@beekl.dev  (CUSTOMER)");
    console.log("");
    console.log("   ⚠️  This is DEVELOPMENT DATA — not real production analytics.");

}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
