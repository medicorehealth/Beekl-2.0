"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Palette, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

/**
 * Unified registration. Users may create a CUSTOMER account or apply as a
 * CREATOR (which creates a PENDING creator profile for admin approval). The
 * role is decided server-side — the client can never request an elevated role.
 */
export default function RegisterPage() {
    const router = useRouter();
    const params = useSearchParams();
    const initialAs = params.get("as") === "creator" ? "creator" : "customer";

    const [as, setAs] = React.useState<"customer" | "creator">(initialAs);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") || "");
        const password = String(form.get("password") || "");

        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(form.get("name") || ""),
                    email,
                    password,
                    phone: String(form.get("phone") || ""),
                    as,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not create account.");
                return;
            }
            // Auto sign-in after successful registration.
            await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            router.push(as === "creator" ? "/creator" : "/account");
            router.refresh();
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="font-display text-3xl font-bold text-ink">Join BeeKL</h1>
            <p className="mt-1 text-sm text-grey-500">
                Create your account. One login for everything.
            </p>

            {/* Role toggle */}
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-paper-soft p-1">
                <RoleTab
                    active={as === "customer"}
                    onClick={() => setAs("customer")}
                    icon={<User className="h-4 w-4" />}
                    label="Shopper"
                />
                <RoleTab
                    active={as === "creator"}
                    onClick={() => setAs("creator")}
                    icon={<Palette className="h-4 w-4" />}
                    label="Creator"
                />
            </div>

            {as === "creator" && (
                <p className="mt-3 rounded-lg bg-honey/15 px-3 py-2 text-xs text-charcoal">
                    Creator accounts start as <b>pending</b>. Our team reviews and
                    approves your community before it goes live.
                </p>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {error && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                        {error}
                    </p>
                )}
                <Input name="name" label="Name" placeholder="Your name" autoComplete="name" required />
                <Input name="email" type="email" label="Email" placeholder="you@email.com" autoComplete="email" required />
                <Input name="phone" label="Phone (optional)" placeholder="+91…" autoComplete="tel" />
                <Input
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />
                <Button type="submit" size="lg" fullWidth disabled={loading}>
                    {loading ? "Creating…" : as === "creator" ? "Apply as Creator" : "Create account"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-grey-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-ink hover:text-flame">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

function RoleTab({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-colors",
                active ? "bg-white text-ink shadow-card" : "text-grey-500 hover:text-ink"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
