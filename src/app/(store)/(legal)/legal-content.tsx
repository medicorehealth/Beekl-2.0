/** Shared layout for legal / policy pages. Placeholder copy — replace with
 *  finalized legal text before launch. */
export function LegalPage({
    title,
    updated,
    children,
}: {
    title: string;
    updated?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bk-container max-w-3xl py-12">
            <h1 className="font-display text-display-sm text-ink">{title}</h1>
            <p className="mt-2 text-sm text-grey-400">
                Last updated: {updated ?? "Draft — placeholder content"}
            </p>
            <div className="bk-prose mt-8">{children}</div>
            <p className="mt-10 rounded-xl border border-grey-200 bg-paper-soft px-4 py-3 text-xs text-grey-500">
                This is placeholder legal content for development. Replace with
                finalized, legally reviewed text before going live.
            </p>
        </div>
    );
}
