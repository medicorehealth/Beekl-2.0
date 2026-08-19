import { SiteChrome } from "@/components/layout/SiteChrome";

// The storefront reads live data (banners, products, session) — render
// dynamically so Vercel doesn't attempt to statically prerender at build time
// (which would run before env/DB are available).
export const dynamic = "force-dynamic";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SiteChrome>{children}</SiteChrome>;
}


