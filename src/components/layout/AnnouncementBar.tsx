import { SITE } from "@/lib/constants";

/** Top announcement bar with a subtle marquee on mobile. */
export function AnnouncementBar() {
    const items = [
        SITE.announcement,
        "THE COMMUNITY MAKES THE CLOTHES.",
        "NEW DROPS EVERY WEEK.",
        "CREATOR MERCH · MEMES · POP CULTURE",
    ];
    return (
        <div className="bg-ink text-paper">
            <div className="bk-container flex h-9 items-center justify-center overflow-hidden">
                {/* Desktop: static centered message */}
                <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] md:block">
                    {SITE.announcement}
                </p>
                {/* Mobile: marquee */}
                <div className="w-full overflow-hidden md:hidden">
                    <div className="bk-marquee gap-8">
                        {[...items, ...items].map((t, i) => (
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
