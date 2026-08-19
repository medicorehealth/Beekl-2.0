"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // In production you'd log this to an error reporter.
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-6 text-center">
            <h1 className="font-display text-3xl font-bold text-ink">
                Something went wrong. Try again.
            </h1>
            <p className="mt-2 max-w-sm text-grey-500">
                A gremlin got into the code. We&apos;ve noted it. You can retry below.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                    onClick={reset}
                    className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-wide text-paper hover:bg-charcoal"
                >
                    Try again
                </button>
                <a
                    href="/"
                    className="inline-flex h-12 items-center rounded-full border-2 border-ink px-6 text-sm font-bold uppercase tracking-wide text-ink hover:bg-ink hover:text-paper"
                >
                    Back home
                </a>
            </div>
        </div>
    );
}
