"use client";

import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Package,
    Lightbulb,
    ShoppingBag,
    TrendingUp,
    Wallet,
    BarChart3,
} from "lucide-react";
import { DashboardShell, type DashNavItem } from "@/components/layout/DashboardShell";

const NAV: DashNavItem[] = [
    { label: "Overview", href: "/creator", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Community", href: "/creator/community", icon: <Users className="h-4 w-4" /> },
    { label: "Products", href: "/creator/products", icon: <Package className="h-4 w-4" /> },
    { label: "Submissions", href: "/creator/submissions", icon: <Lightbulb className="h-4 w-4" /> },
    { label: "Orders", href: "/creator/orders", icon: <ShoppingBag className="h-4 w-4" /> },
    { label: "Analytics", href: "/creator/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Commissions", href: "/creator/commissions", icon: <Wallet className="h-4 w-4" /> },
];

export function CreatorShell({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    return (
        <DashboardShell title={title} subtitle={subtitle} nav={NAV} activeHref={pathname}>
            {children}
        </DashboardShell>
    );
}
