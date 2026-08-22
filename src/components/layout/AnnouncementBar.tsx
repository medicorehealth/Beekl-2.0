import { SITE } from "@/lib/constants";

/**
 * Top announcement bar with a subtle marquee on mobile.
 * Content is admin-editable via SiteSettings (passed as props). Falls back to
 * brand defaults so it renders even with no DB.
 */
export function AnnouncementBar({
    text,
    items,
    active = true,
}: {
    text?: string;
    items?: string[];
    active?: boolean;
} = {}) {
    if (!active) return null;

    const message = text || SITE.announcement;
    const rotating =
        items && items.length
            ? [message, ...items]
            : [
                message,
                "THE COMMUNITY MAKES THE CLOTHES.",
                "NEW DROPS EVERY WEEK.",
                "CREATOR MERCH · MEMES · POP CULTURE",
            ];

    return (
        <div className="bg-ink text-paper">
            <div className="bk-container flex h-9 items-center justify-center overflow-hidden">
                {/* Desktop: static centered message */}
                <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] md:block">
                    {message}
                </p>
                {/* Mobile: marquee */}
                <div className="w-full overflow-hidden md:hidden">
                    <div className="bk-marquee gap-8">
                        {[...rotating, ...rotating].map((t, i) => (
                            <span
                                key={i}
                                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                            >
                                {t} <span className="mx-4 text-honey">✦</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
