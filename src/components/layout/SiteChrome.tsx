import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { getSiteSettings } from "@/lib/settings";

/**
 * Storefront chrome: announcement + header + cart drawer + footer.
 * Reads admin-editable SiteSettings and injects theme accent variables so the
 * brand colours can be changed from the admin panel without code edits.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();

    return (
        <div
            style={
                {
                    // Admin-themeable accents (used by inline utilities where needed).
                    "--bk-honey": settings.accentHoney,
                    "--bk-flame": settings.accentFlame,
                } as React.CSSProperties
            }
        >
            <AnnouncementBar
                active={settings.announcementActive}
                text={settings.announcementText}
                items={settings.announcementItems}
            />
            <Header />
            <main className="min-h-[60vh]">{children}</main>
            <Footer
                brandName={settings.brandName}
                description={settings.footerDescription}
                tagline={settings.footerTagline}
                note={settings.footerNote}
                copyright={settings.copyrightText}
                newsletterEnabled={settings.newsletterEnabled}
                columns={settings.footerColumns}
                socials={settings.socialLinks}
            />
            <CartDrawer />
        </div>
    );
}
