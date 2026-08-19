import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Countdown } from "@/components/commerce/Countdown";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { EmptyState } from "@/components/ui/States";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";
import { listProductsByDrop } from "@/lib/catalog";
import { formatDate } from "@/lib/utils";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const drop = await safe(
        () => prisma.drop.findUnique({ where: { slug: params.slug } }),
        null
    );
    if (!drop) return { title: "Drop not found" };
    return {
        title: drop.name,
        description: drop.story ?? `${drop.name} — a limited BeeKL drop.`,
        alternates: { canonical: `/drops/${drop.slug}` },
    };
}

export const revalidate = 60;

export default async function DropPage({ params }: Props) {
    const drop = await safe(
        () =>
            prisma.drop.findUnique({
                where: { slug: params.slug },
                include: {
                    creator: { select: { displayName: true, handle: true } },
                    community: { select: { name: true, slug: true } },
                },
            }),
        null
    );

    if (!drop) notFound();

    const products = await safe(() => listProductsByDrop(params.slug), []);

    return (
        <div>
            {/* Drop banner */}
            <section className="relative flex min-h-[400px] items-end overflow-hidden bg-ink">
                {drop.bannerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={drop.bannerImage}
                        alt={drop.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-55"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="bk-container relative z-10 py-12">
                    <Badge tone={statusTone(drop.status)} dot className="mb-4">
                        {drop.status}
                    </Badge>
                    {drop.creator && (
                        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-honey">
                            {drop.community?.name ?? drop.creator.displayName}
                        </p>
                    )}
                    <h1 className="font-display text-display-md text-paper">{drop.name}</h1>
                    {drop.story && (
                        <p className="mt-3 max-w-xl text-paper/70">{drop.story}</p>
                    )}
                    <div className="mt-6">
                        {drop.status === "UPCOMING" && drop.releaseAt ? (
                            <Countdown target={drop.releaseAt} />
                        ) : drop.status === "ENDED" ? (
                            <p className="text-sm font-semibold text-paper/60">
                                This drop has ended.{" "}
                                {drop.endAt && `Closed ${formatDate(drop.endAt)}.`}
                            </p>
                        ) : (
                            <p className="text-sm font-semibold text-honey">Live now — while stocks last.</p>
                        )}
                    </div>
                </div>
            </section>

            <div className="bk-container py-10">
                {drop.creator && (
                    <p className="mb-6 text-sm text-grey-500">
                        A drop by{" "}
                        <Link
                            href={`/creators/${drop.creator.handle}`}
                            className="font-bold text-ink hover:text-flame"
                        >
                            {drop.creator.displayName}
                        </Link>
                        {drop.community && (
                            <>
                                {" · "}
                                <Link
                                    href={`/communities/${drop.community.slug}`}
                                    className="font-bold text-ink hover:text-flame"
                                >
                                    {drop.community.name}
                                </Link>
                            </>
                        )}
                    </p>
                )}

                {products.length ? (
                    <ProductGrid products={products} />
                ) : (
                    <EmptyState
                        title={drop.status === "UPCOMING" ? "Not live yet." : "No products in this drop."}
                        description={
                            drop.status === "UPCOMING"
                                ? "Products appear when the drop goes live."
                                : "Check back soon."
                        }
                    />
                )}
            </div>
        </div>
    );
}
