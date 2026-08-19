import * as React from "react";
import { PackageOpen, AlertTriangle, Lock, SearchX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./Button";

/** Generic empty state. */
export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
}: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: { label: string; href: string };
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-2xl border border-dashed border-grey-200 bg-paper-soft px-6 py-16 text-center",
                className
            )}
        >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-grey-400 shadow-card">
                {icon ?? <PackageOpen className="h-6 w-6" />}
            </div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-grey-500">{description}</p>
            )}
            {action && (
                <ButtonLink href={action.href} variant="outline" size="sm" className="mt-5">
                    {action.label}
                </ButtonLink>
            )}
        </div>
    );
}

/** No-results (search) state. */
export function NoResults({ query }: { query?: string }) {
    return (
        <EmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="No products found."
            description={
                query
                    ? `We couldn't find anything for "${query}". Try a different search.`
                    : "Try adjusting your filters or search."
            }
        />
    );
}

/** Error state. */
export function ErrorState({
    message = "Something went wrong. Try again.",
    retryHref,
}: {
    message?: string;
    retryHref?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-danger shadow-card">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">Oops.</h3>
            <p className="mt-1 max-w-sm text-sm text-grey-600">{message}</p>
            {retryHref && (
                <ButtonLink href={retryHref} variant="outline" size="sm" className="mt-5">
                    Try again
                </ButtonLink>
            )}
        </div>
    );
}

/** Unauthorized state. */
export function UnauthorizedState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-grey-200 bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-card">
                <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">
                You don&apos;t have permission to access this.
            </h3>
            <p className="mt-1 max-w-sm text-sm text-grey-500">
                If you think this is a mistake, contact your BeeKL administrator.
            </p>
            <ButtonLink href="/" variant="primary" size="sm" className="mt-5">
                Back to home
            </ButtonLink>
        </div>
    );
}

/** Inline spinner. */
export function Spinner({ className }: { className?: string }) {
    return <Loader2 className={cn("h-5 w-5 animate-spin", className)} />;
}

/** Full section loading state. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-grey-500">
            <Spinner />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

/** "Data unavailable" — shown when a metric source isn't connected. */
export function DataUnavailable({ note }: { note?: string }) {
    return (
        <div className="flex flex-col items-start gap-1 rounded-xl border border-grey-200 bg-paper-soft px-4 py-3">
            <span className="text-sm font-bold text-grey-600">Data unavailable</span>
            {note && <span className="text-xs text-grey-400">{note}</span>}
        </div>
    );
}

/** Product grid skeleton. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="bk-skeleton aspect-[3/4] rounded-2xl" />
                    <div className="bk-skeleton h-4 w-3/4 rounded" />
                    <div className="bk-skeleton h-4 w-1/3 rounded" />
                </div>
            ))}
        </div>
    );
}
