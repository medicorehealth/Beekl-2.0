"use client";

import { usePathname } from "next/navigation";
import { User, Package, Heart, MapPin, Users } from "lucide-react";
import { DashboardShell, type DashNavItem } from "@/components/layout/DashboardShell";

const NAV: DashNavItem[] = [
    { label: "Profile", href: "/account", icon: <User className="h-4 w-4" /> },
    { label: "Orders", href: "/account/orders", icon: <Package className="h-4 w-4" /> },
    { label: "Wishlist", href: "/wishlist", icon: <Heart className="h-4 w-4" /> },
    { label: "Addresses", href: "/account/addresses", icon: <MapPin className="h-4 w-4" /> },
    { label: "Communities", href: "/account/communities", icon: <Users className="h-4 w-4" /> },
];

export function AccountShell({
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
