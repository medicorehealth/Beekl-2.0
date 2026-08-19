"use client";

import * as React from "react";

/** Live countdown to a target date. Shows nothing once elapsed. */
export function Countdown({ target, label = "Drops in" }: { target: string | Date; label?: string }) {
    const targetTime = React.useMemo(() => new Date(target).getTime(), [target]);
    const [now, setNow] = React.useState<number | null>(null);

    React.useEffect(() => {
        setNow(Date.now());
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    if (now === null) return null;
    const diff = targetTime - now;
    if (diff <= 0) return null;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const cells = [
        { v: days, l: "Days" },
        { v: hours, l: "Hrs" },
        { v: mins, l: "Min" },
        { v: secs, l: "Sec" },
    ];

    return (
        <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-honey">
                {label}
            </p>
            <div className="flex gap-2">
                {cells.map((c) => (
                    <div
                        key={c.l}
                        className="flex min-w-[64px] flex-col items-center rounded-xl bg-white/10 px-3 py-2 backdrop-blur"
                    >
                        <span className="font-display text-2xl font-bold tabular-nums text-paper">
                            {String(c.v).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-paper/60">
                            {c.l}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
