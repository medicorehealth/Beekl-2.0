import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { BannerManager } from "@/components/admin/BannerManager";

export const metadata: Metadata = { title: "Admin · Banners", robots: { index: false } };

export default async function AdminBannersPage() {
    await requirePermission("banners.manage", "/admin/banners");

    const banners = await safe(
        () => prisma.banner.findMany({ orderBy: { displayOrder: "asc" } }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader
                title="Banners"
                subtitle="Homepage hero banners. Changes go live instantly — no code needed."
            />
            <BannerManager
                initial={banners.map((b) => ({
                    id: b.id,
                    title: b.title,
                    subtitle: b.subtitle,
                    desktopImage: b.desktopImage,
                    mobileImage: b.mobileImage,
                    primaryButtonText: b.primaryButtonText,
                    primaryButtonLink: b.primaryButtonLink,
                    secondaryButtonText: b.secondaryButtonText,
                    secondaryButtonLink: b.secondaryButtonLink,
                    displayOrder: b.displayOrder,
                    isActive: b.isActive,
                }))}
            />
        </div>
    );
}
