import { SiteChrome } from "@/components/layout/SiteChrome";
import { requireCreator } from "@/lib/session";

/** Creator dashboard layout. Server-guarded: only CREATOR (or admins) enter. */
export default async function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireCreator("/creator");
    return <SiteChrome>{children}</SiteChrome>;
}
