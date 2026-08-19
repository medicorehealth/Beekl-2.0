import Link from "next/link";
import { Lock } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

export const metadata = { title: "Unauthorized", robots: { index: false } };

export default function UnauthorizedPage() {
    return (
        <>
            <AnnouncementBar />
            <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper">
                    <Lock className="h-7 w-7" />
                </div>
                <h1 className="font-display text-3xl font-bold text-ink">
                    You don&apos;t have permission to access this.
                </h1>
                <p className="mt-2 max-w-sm text-grey-500">
                    This area needs a higher access level. If you think this is a
                    mistake, contact your BeeKL administrator.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-wide text-paper hover:bg-charcoal"
                    >
                        Back home
                    </Link>
                    <Link
                        href="/account"
                        className="inline-flex h-12 items-center rounded-full border-2 border-ink px-6 text-sm font-bold uppercase tracking-wide text-ink hover:bg-ink hover:text-paper"
                    >
                        My account
                    </Link>
                </div>
            </div>
        </>
    );
}
