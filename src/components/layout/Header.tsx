"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
    Search,
    Heart,
    ShoppingBag,
    User,
    Menu,
    X,
    LayoutDashboard,
    LogOut,
    Palette,
    ChevronRight,
} from "lucide-react";
import { MAIN_NAV, SITE } from "@/lib/constants";
import { isAdminRole } from "@/lib/rbac";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { SearchDialog } from "./SearchDialog";
import { cn } from "@/lib/utils";

export function Header() {
    const { data: session } = useSession();
    const { count: cartCount, setOpen: setCartOpen } = useCart();
    const { count: wishlistCount } = useWishlist();

    const [scrolled, setScrolled] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [accountOpen, setAccountOpen] = React.useState(false);

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const role = session?.user?.role;
    const showAdmin = role && isAdminRole(role);
    const showCreator = role === "CREATOR" || showAdmin;

    return (
        <>
            <header
                className={cn(
                    "sticky top-0 z-50 border-b bg-paper/95 backdrop-blur transition-shadow",
                    scrolled ? "border-grey-200 shadow-sm" : "border-transparent"
                )}
            >
                <div className="bk-container">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Left: mobile menu + logo */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <Link href="/" className="select-none">
                                <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
                                    BEE<span className="text-flame">KL</span>
                                </span>
                            </Link>
                        </div>

                        {/* Center: primary nav (desktop) */}
                        <nav className="hidden items-center gap-5 lg:flex">
                            {MAIN_NAV.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-[13px] font-bold uppercase tracking-wide text-ink/80 transition-colors hover:text-ink"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right: actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                aria-label="Search"
                                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-grey-100"
                            >
                                <Search className="h-5 w-5" />
                            </button>

                            {/* Account */}
                            <div className="relative">
                                <button
                                    onClick={() => setAccountOpen((v) => !v)}
                                    onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
                                    aria-label="Account"
                                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-grey-100"
                                >
                                    <User className="h-5 w-5" />
                                </button>
                                {accountOpen && (
                                    <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-grey-200 bg-white shadow-lift animate-scale-in">
                                        {session?.user ? (
                                            <>
                                                <div className="border-b border-grey-100 px-4 py-3">
                                                    <p className="text-sm font-bold text-ink line-clamp-1">
                                                        {session.user.name || "Your account"}
                                                    </p>
                                                    <p className="text-xs text-grey-400 line-clamp-1">
                                                        {session.user.email}
                                                    </p>
                                                </div>
                                                <AccountLink href="/account" icon={<User className="h-4 w-4" />} label="My Account" />
                                                {showCreator && (
                                                    <AccountLink href="/creator" icon={<Palette className="h-4 w-4" />} label="Creator Dashboard" />
                                                )}
                                                {showAdmin && (
                                                    <AccountLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Admin Panel" />
                                                )}
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/" })}
                                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-flame hover:bg-paper-soft"
                                                >
                                                    <LogOut className="h-4 w-4" /> Sign out
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <AccountLink href="/login" icon={<User className="h-4 w-4" />} label="Sign in" />
                                                <AccountLink href="/register" icon={<ChevronRight className="h-4 w-4" />} label="Create account" />
                                                <AccountLink href="/register?as=creator" icon={<Palette className="h-4 w-4" />} label="Become a Creator" />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Wishlist */}
                            <Link
                                href="/wishlist"
                                aria-label="Wishlist"
                                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-grey-100"
                            >
                                <Heart className="h-5 w-5" />
                                {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
                            </Link>

                            {/* Cart */}
                            <button
                                onClick={() => setCartOpen(true)}
                                aria-label="Open bag"
                                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-grey-100"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && <CountBadge n={cartCount} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
            <MobileNav
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                onSearch={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                }}
                showAdmin={!!showAdmin}
                showCreator={!!showCreator}
                isAuthed={!!session?.user}
            />
        </>
    );
}

function AccountLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-paper-soft">
            {icon} {label}
        </Link>
    );
}

function CountBadge({ n }: { n: number }) {
    return (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-flame px-1 text-[10px] font-bold text-white">
            {n > 9 ? "9+" : n}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Mobile navigation drawer
// ---------------------------------------------------------------------------
function MobileNav({
    open,
    onClose,
    onSearch,
    showAdmin,
    showCreator,
    isAuthed,
}: {
    open: boolean;
    onClose: () => void;
    onSearch: () => void;
    showAdmin: boolean;
    showCreator: boolean;
    isAuthed: boolean;
}) {
    React.useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[95] lg:hidden">
            <div className="absolute inset-0 bg-ink/60 animate-fade-in" onClick={onClose} />
            <div className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-paper animate-slide-in-left">
                <div className="flex items-center justify-between border-b border-grey-200 px-5 py-4">
                    <span className="font-display text-xl font-extrabold">
                        BEE<span className="text-flame">KL</span>
                    </span>
                    <button onClick={onClose} aria-label="Close menu">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <button
                    onClick={onSearch}
                    className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-grey-200 bg-white px-4 py-3 text-sm text-grey-400"
                >
                    <Search className="h-4 w-4" /> Search BeeKL
                </button>

                <nav className="flex-1 overflow-y-auto px-2 py-4">
                    {MAIN_NAV.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-bold uppercase tracking-wide text-ink hover:bg-white"
                        >
                            {item.label}
                            <ChevronRight className="h-4 w-4 text-grey-300" />
                        </Link>
                    ))}
                </nav>

                <div className="space-y-1 border-t border-grey-200 p-4">
                    <Link href="/account" onClick={onClose} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-white">
                        <User className="h-4 w-4" /> {isAuthed ? "My Account" : "Sign in"}
                    </Link>
                    {showCreator && (
                        <Link href="/creator" onClick={onClose} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-white">
                            <Palette className="h-4 w-4" /> Creator Dashboard
                        </Link>
                    )}
                    {showAdmin && (
                        <Link href="/admin" onClick={onClose} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-white">
                            <LayoutDashboard className="h-4 w-4" /> Admin Panel
                        </Link>
                    )}
                    <p className="px-3 pt-2 text-[11px] uppercase tracking-wide text-grey-400">
                        {SITE.tagline}
                    </p>
                </div>
            </div>
        </div>
    );
}
