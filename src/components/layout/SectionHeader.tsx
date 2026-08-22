import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
    kicker,
    title,
    href,
    linkLabel = "View all",
}: {
    kicker?: string;
    title: string;
    href?: string;
    linkLabel?: string;
}) {
    return (
        <div className="mb-8 flex items-end justify-between gap-4">
            <div>
                {kicker && (
                    <span className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-grey-400">
                        <span className="h-px w-8 bg-flame" />
                        {kicker}
                    </span>
                )}
                <h2 className="font-display text-display-sm font-bold uppercase tracking-tight text-ink">
                    {title}
                </h2>
            </div>
            {href && (
                <Link
                    href={href}
                    className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper sm:flex"
                >
                    {linkLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
}
