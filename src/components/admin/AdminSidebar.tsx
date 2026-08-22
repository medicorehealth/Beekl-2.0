"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    UserCog,
    Boxes,
    Lightbulb,
    Trophy,
    Rocket,
    Truck,
    Wallet,
    CreditCard,
    Image as ImageIcon,
    LayoutTemplate,
    Paintbrush,
    BarChart3,
    Settings,

    LogOut,
    Menu,
    X,
    RotateCcw,
    Printer,
    Home,
} from "lucide-react";
import { roleLabel } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ReactNode; perm?: string };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
    {
        title: "Overview",
        items: [{ label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> }],
    },
    {
        title: "Commerce",
        items: [
            { label: "Products", href: "/admin/products", icon: <Package className="h-4 w-4" />, perm: "products.view" },
            { label: "Orders", href: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" />, perm: "orders.view" },
            { label: "Customers", href: "/admin/customers", icon: <Users className="h-4 w-4" />, perm: "customers.view" },
        ],
    },
    {
        title: "Community",
        items: [
            { label: "Creators", href: "/admin/creators", icon: <UserCog className="h-4 w-4" />, perm: "creators.view" },
            { label: "Communities", href: "/admin/communities", icon: <Boxes className="h-4 w-4" />, perm: "communities.view" },
            { label: "Submissions", href: "/admin/submissions", icon: <Lightbulb className="h-4 w-4" />, perm: "submissions.view" },
            { label: "Contests", href: "/admin/contests", icon: <Trophy className="h-4 w-4" />, perm: "contests.view" },
        ],
    },
    {
        title: "Drops",
        items: [{ label: "Drops", href: "/admin/drops", icon: <Rocket className="h-4 w-4" />, perm: "drops.view" }],
    },
    {
        title: "Fulfillment",
        items: [
            { label: "POD Orders", href: "/admin/pod", icon: <Printer className="h-4 w-4" />, perm: "fulfillment.view" },
            { label: "Shipping", href: "/admin/shipping", icon: <Truck className="h-4 w-4" />, perm: "fulfillment.view" },
            { label: "Returns", href: "/admin/returns", icon: <RotateCcw className="h-4 w-4" />, perm: "returns.manage" },
        ],
    },
    {
        title: "Finance",
        items: [
            { label: "Commissions", href: "/admin/commissions", icon: <Wallet className="h-4 w-4" />, perm: "commissions.view" },
            { label: "Payouts", href: "/admin/payouts", icon: <CreditCard className="h-4 w-4" />, perm: "payouts.view" },
        ],
    },
    {
        title: "Content",
        items: [
            { label: "Appearance", href: "/admin/appearance", icon: <Paintbrush className="h-4 w-4" />, perm: "settings.manage" },
            { label: "Banners", href: "/admin/banners", icon: <ImageIcon className="h-4 w-4" />, perm: "banners.manage" },
            { label: "Homepage", href: "/admin/homepage", icon: <LayoutTemplate className="h-4 w-4" />, perm: "homepage.manage" },
        ],
    },

    {
        title: "Insights",
        items: [
            { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" />, perm: "analytics.view" },
            { label: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" />, perm: "settings.manage" },
        ],
    },
];

export function AdminSidebar({ permissions }: { permissions: string[] }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const can = (perm?: string) => !perm || permissions.includes(perm);

    const content = (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-5">
                <Link href="/admin" className="font-display text-xl font-extrabold text-paper">
                    BEE<span className="text-honey">KL</span>
                    <span className="ml-1.5 align-middle text-[10px] font-bold uppercase tracking-widest text-paper/40">
                        Admin
                    </span>
                </Link>
                <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close">
                    <X className="h-5 w-5 text-paper/60" />
                </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
                {GROUPS.map((group) => {
                    const items = group.items.filter((i) => can(i.perm));
                    if (!items.length) return null;
                    return (
                        <div key={group.title}>
                            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">
                                {group.title}
                            </p>
                            <ul className="space-y-0.5">
                                {items.map((item) => {
                                    const active =
                                        item.href === "/admin"
                                            ? pathname === "/admin"
                                            : pathname.startsWith(item.href);
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                    active
                                                        ? "bg-paper text-ink"
                                                        : "text-paper/70 hover:bg-white/10 hover:text-paper"
                                                )}
                                            >
                                                {item.icon}
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="mb-3 px-1">
                    <p className="truncate text-sm font-semibold text-paper">
                        {session?.user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-paper/40">
                        {session?.user?.role ? roleLabel(session.user.role) : ""}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2 text-xs font-semibold text-paper hover:bg-white/20"
                    >
                        <Home className="h-3.5 w-3.5" /> Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2 text-xs font-semibold text-paper hover:bg-flame"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="flex items-center justify-between border-b border-grey-200 bg-ink px-4 py-3 lg:hidden">
                <Link href="/admin" className="font-display text-lg font-extrabold text-paper">
                    BEE<span className="text-honey">KL</span> Admin
                </Link>
                <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
                    <Menu className="h-6 w-6 text-paper" />
                </button>
            </div>

            {/* Desktop sidebar */}
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-ink lg:block">
                {content}
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[95] lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-72 bg-ink animate-slide-in-left">
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}
