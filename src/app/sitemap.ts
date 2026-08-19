import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap. Includes static routes plus published products, collections,
 * creators, communities and drops from the database.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const base = SITE.url;

    const staticRoutes = [
        "",
        "/shop",
        "/collections",
        "/drops",
        "/memes",
        "/movies-tv",
        "/anime",
        "/creators",
        "/communities",
        "/contest",
        "/privacy",
        "/terms",
        "/refund-policy",
        "/shipping-policy",
        "/contact",
    ].map((path) => ({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1 : 0.7,
    }));

    const [products, collections, creators, communities, drops] = await Promise.all([
        safe(() => prisma.productReference.findMany({ where: { status: "ACTIVE" }, select: { handle: true, updatedAt: true } }), []),
        safe(() => prisma.collectionRef.findMany({ select: { slug: true, updatedAt: true } }), []),
        safe(() => prisma.creator.findMany({ where: { status: { in: ["APPROVED", "FEATURED"] } }, select: { handle: true, updatedAt: true } }), []),
        safe(() => prisma.community.findMany({ where: { status: { in: ["APPROVED", "FEATURED"] } }, select: { slug: true, updatedAt: true } }), []),
        safe(() => prisma.drop.findMany({ select: { slug: true, updatedAt: true } }), []),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [
        ...products.map((p) => ({ url: `${base}/products/${p.handle}`, lastModified: p.updatedAt })),
        ...collections.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: c.updatedAt })),
        ...creators.map((c) => ({ url: `${base}/creators/${c.handle}`, lastModified: c.updatedAt })),
        ...communities.map((c) => ({ url: `${base}/communities/${c.slug}`, lastModified: c.updatedAt })),
        ...drops.map((d) => ({ url: `${base}/drops/${d.slug}`, lastModified: d.updatedAt })),
    ];

    return [...staticRoutes, ...dynamicRoutes];
}
