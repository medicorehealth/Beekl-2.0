import { cn } from "@/lib/utils";

/** Compact metric card for dashboards. Shows a real value or "—" when unknown. */
export function StatsCard({
    label,
    value,
    sub,
    icon,
    tone = "default",
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon?: React.ReactNode;
    tone?: "default" | "dark" | "accent";
}) {
    return (
        <div
            className={cn(
                "rounded-2xl border p-5",
                tone === "dark"
                    ? "border-ink bg-ink text-paper"
                    : tone === "accent"
                        ? "border-honey bg-honey text-ink"
                        : "border-grey-200 bg-white"
            )}
        >
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        "text-xs font-bold uppercase tracking-wide",
                        tone === "dark" ? "text-paper/60" : "text-grey-500"
                    )}
                >
                    {label}
                </span>
                {icon && (
                    <span className={tone === "dark" ? "text-honey" : "text-grey-400"}>
                        {icon}
                    </span>
                )}
            </div>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
            {sub && (
                <p
                    className={cn(
                        "mt-1 text-xs",
                        tone === "dark" ? "text-paper/50" : "text-grey-400"
                    )}
                >
                    {sub}
                </p>
            )}
        </div>
    );
}
