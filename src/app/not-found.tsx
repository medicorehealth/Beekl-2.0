import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

// Rendered dynamically (avoids the static export step that failed on Vercel).
export const dynamic = "force-dynamic";

export default function NotFound() {

    return (
        <>
            <AnnouncementBar />
            <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-6 text-center">
                <span className="font-display text-display-xl text-ink">404</span>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                    This page ghosted you.
                </h1>
                <p className="mt-2 max-w-sm text-grey-500">
                    The link you followed doesn&apos;t exist (or dropped and sold out).
                    Let&apos;s get you back to the good stuff.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-wide text-paper hover:bg-charcoal"
                    >
                        Back home
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex h-12 items-center rounded-full border-2 border-ink px-6 text-sm font-bold uppercase tracking-wide text-ink hover:bg-ink hover:text-paper"
                    >
                        Shop all
                    </Link>
                </div>
            </div>
        </>
    );
}
