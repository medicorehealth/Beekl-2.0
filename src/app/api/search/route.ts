import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listProducts } from "@/lib/catalog";

/**
 * Global search API — searches products, creators, communities, collections
 * and drops. Debounced client-side; returns compact suggestions.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
        return NextResponse.json({
            products: [],
            creators: [],
            communities: [],
            collections: [],
            drops: [],
        });
    }

    const [products, creators, communities, collections, drops] = await Promise.all([
        listProducts({ query: q, first: 6 }).catch(() => []),
        prisma.creator.findMany({
            where: {
                status: { in: ["APPROVED", "FEATURED"] },
                OR: [
                    { displayName: { contains: q, mode: "insensitive" } },
                    { handle: { contains: q, mode: "insensitive" } },
                ],
            },
            select: { handle: true, displayName: true, avatarImage: true },
            take: 4,
        }),
        prisma.community.findMany({
            where: {
                status: { in: ["APPROVED", "FEATURED"] },
                name: { contains: q, mode: "insensitive" },
            },
            select: { slug: true, name: true },
            take: 4,
        }),
        prisma.collectionRef.findMany({
            where: { title: { contains: q, mode: "insensitive" } },
            select: { slug: true, title: true },
            take: 4,
        }),
        prisma.drop.findMany({
            where: { name: { contains: q, mode: "insensitive" } },
            select: { slug: true, name: true, status: true },
            take: 4,
        }),
    ]);

    return NextResponse.json({
        products: products.map((p) => ({
            handle: p.handle,
            title: p.title,
            image: p.image,
            price: p.price,
        })),
        creators,
        communities,
        collections,
        drops,
    });
}
