"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
    id: string;
    title: string;
    subtitle?: string | null;
    desktopImage: string;
    mobileImage?: string | null;
    primaryButtonText?: string | null;
    primaryButtonLink?: string | null;
    secondaryButtonText?: string | null;
    secondaryButtonLink?: string | null;
};

/**
 * Full-width responsive hero carousel.
 * Features: autoplay, swipe, arrows, dots, pause on hover, responsive images,
 * lazy loading (except first slide which is eager for LCP).
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
    const [index, setIndex] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const touchStartX = React.useRef<number | null>(null);
    const count = slides.length;

    const go = React.useCallback(
        (n: number) => setIndex((prev) => (n + count) % count),
        [count]
    );

    React.useEffect(() => {
        if (paused || count <= 1) return;
        const t = setInterval(() => setIndex((p) => (p + 1) % count), 6000);
        return () => clearInterval(t);
    }, [paused, count]);

    if (count === 0) return null;

    return (
        <section
            className="relative w-full overflow-hidden bg-ink"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touchStartX.current == null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 50) go(dx < 0 ? index + 1 : index - 1);
                touchStartX.current = null;
            }}
            aria-roledescription="carousel"
        >
            <div className="relative h-[72vh] max-h-[760px] min-h-[440px] w-full">
                {slides.map((slide, i) => (
                    <div
                        key={slide.id}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-700",
                            i === index ? "opacity-100" : "pointer-events-none opacity-0"
                        )}
                        aria-hidden={i !== index}
                    >
                        {/* Responsive image */}
                        <picture>
                            {slide.mobileImage && (
                                <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={slide.desktopImage}
                                alt={slide.title}
                                loading={i === 0 ? "eager" : "lazy"}
                                className="h-full w-full object-cover"
                            />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0">
                            <div className="bk-container flex h-full flex-col justify-center">
                                <div className="max-w-2xl animate-fade-up">
                                    <h1 className="font-display text-display-lg text-paper text-balance">
                                        {slide.title}
                                    </h1>
                                    {slide.subtitle && (
                                        <p className="mt-4 max-w-md text-base text-paper/80 md:text-lg">
                                            {slide.subtitle}
                                        </p>
                                    )}
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {slide.primaryButtonText && slide.primaryButtonLink && (
                                            <Link
                                                href={slide.primaryButtonLink}
                                                className="inline-flex h-14 items-center rounded-full bg-paper px-8 text-sm font-bold uppercase tracking-wide text-ink transition-transform hover:scale-105"
                                            >
                                                {slide.primaryButtonText}
                                            </Link>
                                        )}
                                        {slide.secondaryButtonText && slide.secondaryButtonLink && (
                                            <Link
                                                href={slide.secondaryButtonLink}
                                                className="inline-flex h-14 items-center rounded-full border-2 border-paper/60 px-8 text-sm font-bold uppercase tracking-wide text-paper transition-colors hover:bg-paper hover:text-ink"
                                            >
                                                {slide.secondaryButtonText}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Arrows */}
            {count > 1 && (
                <>
                    <button
                        onClick={() => go(index - 1)}
                        aria-label="Previous slide"
                        className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink transition-transform hover:scale-110 md:flex"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => go(index + 1)}
                        aria-label="Next slide"
                        className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink transition-transform hover:scale-110 md:flex"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    i === index ? "w-8 bg-paper" : "w-1.5 bg-paper/50"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
