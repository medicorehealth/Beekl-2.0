import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/commerce/CartDrawer";

/** Storefront chrome: announcement + header + cart drawer + footer. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AnnouncementBar />
            <Header />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
            <CartDrawer />
        </>
    );
}
