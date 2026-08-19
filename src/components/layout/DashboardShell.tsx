import Link from "next/link";
import { cn } from "@/lib/utils";

export type DashNavItem = {
    label: string;
    href: string;
    icon?: React.ReactNode;
};

/**
 * Shared dashboard shell used by the customer account + creator dashboard.
 * Sidebar on desktop, horizontal scroll tabs on mobile.
 */
export function DashboardShell({
    title,
    subtitle,
    nav,
    activeHref,
    children,
    aside,
}: {
    title: string;
    subtitle?: string;
    nav: DashNavItem[];
    activeHref: string;
    children: React.ReactNode;
    aside?: React.ReactNode;
}) {
    return (
        <div className="bk-container py-8">
            <header className="mb-6">
                <h1 className="font-display text-display-sm text-ink">{title}</h1>
                {subtitle && <p className="mt-1 text-grey-500">{subtitle}</p>}
            </header>

            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                {/* Nav */}
                <nav className="lg:sticky lg:top-24 lg:self-start">
                    <ul className="flex gap-1 overflow-x-auto bk-scroll-hide lg:flex-col">
                        {nav.map((item) => {
                            const active =
                                activeHref === item.href ||
                                (item.href !== nav[0]?.href && activeHref.startsWith(item.href));
                            return (
                                <li key={item.href} className="shrink-0">
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                                            active
                                                ? "bg-ink text-paper"
                                                : "text-grey-600 hover:bg-grey-100 hover:text-ink"
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    {aside && <div className="mt-6 hidden lg:block">{aside}</div>}
                </nav>

                {/* Content */}
                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}
