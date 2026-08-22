"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
 * Premium full-width auto-sliding hero carousel.
 * Features: autoplay (configurable), Ken-Burns zoom, animated progress bar,
 * swipe, arrows, dots, pause on hover, responsive images, lazy loading.
 */
export function HeroCarousel({
    slides,
    autoplayMs = 6000,
}: {
    slides: HeroSlide[];
    autoplayMs?: number;
}) {
    const [index, setIndex] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const touchStartX = React.useRef<number | null>(null);
    const count = slides.length;
    const interval = Math.max(2500, autoplayMs || 6000);

    const go = React.useCallback(
        (n: number) => setIndex((prev) => (n + count) % count),
        [count]
    );

    React.useEffect(() => {
        if (paused || count <= 1) return;
        const t = setInterval(() => setIndex((p) => (p + 1) % count), interval);
        return () => clearInterval(t);
    }, [paused, count, interval]);

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
            <div className="relative h-[78vh] max-h-[820px] min-h-[480px] w-full">
                {slides.map((slide, i) => {
                    const active = i === index;
                    return (
                        <div
                            key={slide.id}
                            className={cn(
                                "absolute inset-0 transition-opacity duration-[900ms] ease-out",
                                active ? "opacity-100" : "pointer-events-none opacity-0"
                            )}
                            aria-hidden={!active}
                        >
                            {/* Responsive image with slow Ken-Burns zoom while active */}
                            <div className="absolute inset-0 overflow-hidden">
                                <picture>
                                    {slide.mobileImage && (
                                        <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                                    )}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={slide.desktopImage}
                                        alt={slide.title}
                                        loading={i === 0 ? "eager" : "lazy"}
                                        className={cn(
                                            "h-full w-full object-cover will-change-transform",
                                            active && "animate-ken-burns"
                                        )}
                                    />
                                </picture>
                            </div>

                            {/* Cinematic gradient wash */}
                            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />

                            {/* Content */}
                            <div className="absolute inset-0">
                                <div className="bk-container flex h-full flex-col justify-center">
                                    <div
                                        className={cn(
                                            "max-w-2xl",
                                            active && "animate-fade-up"
                                        )}
                                    >
                                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-paper/25 bg-paper/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-paper/80 backdrop-blur-sm">
                                            <span className="h-1.5 w-1.5 rounded-full bg-honey" />
                                            BeeKL Originals
                                        </span>
                                        <h1 className="font-display text-display-lg text-paper text-balance drop-shadow-sm">
                                            {slide.title}
                                        </h1>
                                        {slide.subtitle && (
                                            <p className="mt-5 max-w-md text-base leading-relaxed text-paper/85 md:text-lg">
                                                {slide.subtitle}
                                            </p>
                                        )}
                                        <div className="mt-9 flex flex-wrap gap-3">
                                            {slide.primaryButtonText && slide.primaryButtonLink && (
                                                <Link
                                                    href={slide.primaryButtonLink}
                                                    className="group inline-flex h-14 items-center gap-2 rounded-full bg-paper px-8 text-sm font-bold uppercase tracking-wide text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                                                >
                                                    {slide.primaryButtonText}
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            )}
                                            {slide.secondaryButtonText && slide.secondaryButtonLink && (
                                                <Link
                                                    href={slide.secondaryButtonLink}
                                                    className="inline-flex h-14 items-center rounded-full border border-paper/50 bg-paper/5 px-8 text-sm font-bold uppercase tracking-wide text-paper backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
                                                >
                                                    {slide.secondaryButtonText}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Arrows */}
            {count > 1 && (
                <>
                    <button
                        onClick={() => go(index - 1)}
                        aria-label="Previous slide"
                        className="absolute left-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-paper/20 bg-ink/30 text-paper backdrop-blur-md transition-all hover:scale-110 hover:bg-paper hover:text-ink md:flex"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => go(index + 1)}
                        aria-label="Next slide"
                        className="absolute right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-paper/20 bg-ink/30 text-paper backdrop-blur-md transition-all hover:scale-110 hover:bg-paper hover:text-ink md:flex"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Progress dots with animated fill */}
                    <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2.5">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className="group relative py-2"
                            >
                                <span
                                    className={cn(
                                        "block h-1 overflow-hidden rounded-full bg-paper/30 transition-all duration-300",
                                        i === index ? "w-10" : "w-4 group-hover:w-6"
                                    )}
                                >
                                    {i === index && !paused && (
                                        <span
                                            key={`${index}-${paused}`}
                                            className="block h-full origin-left rounded-full bg-paper"
                                            style={{
                                                animation: `hero-progress ${interval}ms linear forwards`,
                                            }}
                                        />
                                    )}
                                    {i === index && paused && (
                                        <span className="block h-full rounded-full bg-paper" />
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
