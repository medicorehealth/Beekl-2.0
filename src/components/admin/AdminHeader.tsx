export function AdminHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
                    {title}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-grey-500">{subtitle}</p>}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}

/** Simple responsive data table wrapper: table on desktop, cards on mobile. */
export function DataTable<T>({
    columns,
    rows,
    renderCell,
    renderMobile,
    empty,
}: {
    columns: { key: string; label: string }[];
    rows: T[];
    renderCell: (row: T, key: string) => React.ReactNode;
    renderMobile: (row: T) => React.ReactNode;
    empty?: React.ReactNode;
}) {
    if (!rows.length) {
        return <>{empty}</>;
    }
    return (
        <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-grey-200 bg-white md:block">
                <table className="w-full text-sm">
                    <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                        <tr>
                            {columns.map((c) => (
                                <th key={c.key} className="px-5 py-3 font-bold">
                                    {c.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-100">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-paper-soft/50">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-5 py-3">
                                        {renderCell(row, c.key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
                {rows.map((row, i) => (
                    <div key={i} className="rounded-2xl border border-grey-200 bg-white p-4">
                        {renderMobile(row)}
                    </div>
                ))}
            </div>
        </>
    );
}
