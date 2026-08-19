import type { Metadata } from "next";
import Link from "next/link";
import { ImageIcon, Boxes, UserCog, Rocket, Trophy, ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = { title: "Admin · Homepage", robots: { index: false } };

export default async function AdminHomepagePage() {
    await requirePermission("homepage.manage", "/admin/homepage");

    const [banners, featuredCollections, featuredCreators, featuredCommunities, activeDrops] =
        await Promise.all([
            safe(() => prisma.banner.count({ where: { isActive: true } }), 0),
            safe(() => prisma.collectionRef.count({ where: { isFeatured: true } }), 0),
            safe(() => prisma.creator.count({ where: { isFeatured: true } }), 0),
            safe(() => prisma.community.count({ where: { isFeatured: true } }), 0),
            safe(() => prisma.drop.count({ where: { status: { in: ["LIVE", "UPCOMING"] } } }), 0),
        ]);

    return (
        <div className="p-5 md:p-8">
            <AdminHeader
                title="Homepage"
                subtitle="Control what appears on the homepage — no code changes needed."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <CmsCard
                    icon={<ImageIcon className="h-5 w-5" />}
                    title="Hero banners"
                    count={banners}
                    unit="active"
                    href="/admin/banners"
                    body="The rotating hero at the top of the homepage."
                />
                <CmsCard
                    icon={<Boxes className="h-5 w-5" />}
                    title="Featured collections"
                    count={featuredCollections}
                    unit="featured"
                    href="/admin/products"
                    body="Curated collections shown on the homepage."
                />
                <CmsCard
                    icon={<UserCog className="h-5 w-5" />}
                    title="Featured creators"
                    count={featuredCreators}
                    unit="featured"
                    href="/admin/creators"
                    body="Creators spotlighted in the creator merch rail."
                />
                <CmsCard
                    icon={<Boxes className="h-5 w-5" />}
                    title="Featured communities"
                    count={featuredCommunities}
                    unit="featured"
                    href="/admin/communities"
                    body="Communities shown in the community section."
                />
                <CmsCard
                    icon={<Rocket className="h-5 w-5" />}
                    title="Active drops"
                    count={activeDrops}
                    unit="live/upcoming"
                    href="/admin/drops"
                    body="Drops surfaced in the New Drops section."
                />
                <CmsCard
                    icon={<Trophy className="h-5 w-5" />}
                    title="Contest section"
                    count={null}
                    unit=""
                    href="/admin/contests"
                    body="The contest CTA reflects the current active contest."
                />
            </div>

            <p className="mt-6 text-xs text-grey-400">
                Homepage sections are driven by database flags (isFeatured, isActive,
                status). Toggle those from each section&apos;s admin page and the
                homepage updates automatically.
            </p>
        </div>
    );
}

function CmsCard({
    icon,
    title,
    count,
    unit,
    href,
    body,
}: {
    icon: React.ReactNode;
    title: string;
    count: number | null;
    unit: string;
    href: string;
    body: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-grey-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover"
        >
            <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper">
                    {icon}
                </span>
                <ArrowRight className="h-4 w-4 text-grey-300 transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-bold text-ink">{title}</h3>
            {count !== null && (
                <p className="mt-1 text-sm font-semibold text-grey-600">
                    {count} {unit}
                </p>
            )}
            <p className="mt-2 text-sm text-grey-500">{body}</p>
        </Link>
    );
}
