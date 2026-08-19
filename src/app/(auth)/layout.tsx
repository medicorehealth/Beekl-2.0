import Link from "next/link";
import { SITE } from "@/lib/constants";

// Auth pages read the URL (useSearchParams) — render them dynamically so the
// production build never tries to statically prerender them.
export const dynamic = "force-dynamic";

/** Minimal split-screen auth layout — unified for all roles. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left: brand panel */}
            <div className="relative hidden overflow-hidden bg-ink lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1200&q=80"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between p-12">
                    <Link href="/" className="font-display text-3xl font-extrabold text-paper">
                        BEE<span className="text-flame">KL</span>
                    </Link>
                    <div>
                        <h2 className="font-display text-display-sm text-paper text-balance">
                            The community makes the clothes.
                        </h2>
                        <p className="mt-3 max-w-sm text-paper/60">
                            One account for everything — shop, create, build a community, or
                            run the show.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex items-center justify-center bg-paper px-6 py-12">
                <div className="w-full max-w-sm">
                    <Link
                        href="/"
                        className="mb-8 inline-block font-display text-2xl font-extrabold lg:hidden"
                    >
                        BEE<span className="text-flame">KL</span>
                    </Link>
                    {children}
                    <p className="mt-8 text-center text-xs text-grey-400">
                        {SITE.tagline}
                    </p>
                </div>
            </div>
        </div>
    );
}
