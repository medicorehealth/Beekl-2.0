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
        <div className="mb-6 flex items-end justify-between gap-4">
            <div>
                {kicker && <span className="bk-kicker mb-2">{kicker}</span>}
                <h2 className="font-display text-display-sm text-ink">{title}</h2>
            </div>
            {href && (
                <Link
                    href={href}
                    className="group hidden shrink-0 items-center gap-1 text-sm font-bold uppercase tracking-wide text-ink hover:text-flame sm:flex"
                >
                    {linkLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
}
