"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Unified login. There is NO separate admin login — everyone signs in here.
 * After sign-in we route by intent (callbackUrl) and let server guards enforce
 * role-based access.
 */
function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const callbackUrl = params.get("callbackUrl") || "/account";

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email: String(form.get("email") || ""),
                password: String(form.get("password") || ""),
                redirect: false,
            });
            if (res?.error) {
                setError("Invalid email or password.");
                return;
            }
            router.push(callbackUrl);
            router.refresh();
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="font-display text-3xl font-bold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-grey-500">
                Sign in to shop, save and create.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
                {error && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                        {error}
                    </p>
                )}
                <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                />
                <Input
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                />
                <Button type="submit" size="lg" fullWidth disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-grey-500">
                New here?{" "}
                <Link href="/register" className="font-bold text-ink hover:text-flame">
                    Create an account
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    // useSearchParams must be inside a Suspense boundary for the production build.
    return (
        <React.Suspense fallback={<div className="h-64" />}>
            <LoginForm />
        </React.Suspense>
    );
}
