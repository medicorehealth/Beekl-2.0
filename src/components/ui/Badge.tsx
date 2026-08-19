import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
    | "ink"
    | "paper"
    | "honey"
    | "flame"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";

const tones: Record<Tone, string> = {
    ink: "bg-ink text-paper",
    paper: "bg-paper-muted text-ink",
    honey: "bg-honey text-ink",
    flame: "bg-flame text-white",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/30",
    danger: "bg-danger/10 text-danger border border-danger/20",
    info: "bg-info/10 text-info border border-info/20",
    neutral: "bg-grey-100 text-grey-700",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: Tone;
    dot?: boolean;
}

export function Badge({ className, tone = "neutral", dot, children, ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                tones[tone],
                className
            )}
            {...props}
        >
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
}

/** Map a status string to an appropriate tone. */
export function statusTone(status: string): Tone {
    const s = status.toUpperCase();
    if (["LIVE", "APPROVED", "PAID", "ACTIVE", "FEATURED", "PAYABLE", "OPEN", "WINNER"].includes(s))
        return "success";
    if (["UPCOMING", "PENDING", "UNDER_REVIEW", "NEW", "QUEUED", "SUBMITTED", "VOTING", "IN_PRODUCTION"].includes(s))
        return "warning";
    if (["ENDED", "REJECTED", "CANCELLED", "FAILED", "SUSPENDED", "ARCHIVED", "RETURNED"].includes(s))
        return "danger";
    if (["DRAFT", "NOT_SUBMITTED", "UNFULFILLED"].includes(s)) return "neutral";
    return "info";
}
