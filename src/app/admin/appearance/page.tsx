import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AppearanceManager } from "@/components/admin/AppearanceManager";

export const metadata: Metadata = { title: "Admin · Appearance", robots: { index: false } };

export default async function AdminAppearancePage() {
    await requirePermission("settings.manage", "/admin/appearance");
    const settings = await getSiteSettings();

    return (
        <div className="p-5 md:p-8">
            <AdminHeader
                title="Appearance & Content"
                subtitle="Customize branding, theme, announcement, homepage sections, footer and social links — no code needed."
            />
            <AppearanceManager initial={settings} />
        </div>
    );
}
