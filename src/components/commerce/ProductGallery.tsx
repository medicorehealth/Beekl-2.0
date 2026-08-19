"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ProductGallery({
    images,
    title,
    demo,
}: {
    images: string[];
    title: string;
    demo?: boolean;
}) {
    const [active, setActive] = React.useState(0);
    const gallery = images.length ? images : [];

    return (
        <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-grey-100">
                {gallery[active] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={gallery[active]}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-grey-400">
                        No image
                    </div>
                )}
                {demo && (
                    <Badge tone="paper" className="absolute left-3 top-3 opacity-90">
                        Demo image
                    </Badge>
                )}
            </div>

            {gallery.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto bk-scroll-hide">
                    {gallery.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={cn(
                                "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-grey-100",
                                i === active ? "border-ink" : "border-transparent"
                            )}
                            aria-label={`View image ${i + 1}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
