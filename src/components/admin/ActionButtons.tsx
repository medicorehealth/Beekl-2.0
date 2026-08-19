"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Method = "POST" | "PATCH" | "DELETE";

/**
 * Generic admin action button — POSTs an action to an API endpoint and refreshes.
 * Used for moderation actions (approve/reject/etc.) across the admin panel.
 */
export function ActionButton({
    endpoint,
    method = "PATCH",
    body,
    label,
    variant = "primary",
    size = "sm",
    confirm,
    successMessage = "Done.",
}: {
    endpoint: string;
    method?: Method;
    body?: Record<string, unknown>;
    label: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
    size?: "sm" | "md" | "lg";
    confirm?: string;
    successMessage?: string;
}) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);

    async function run() {
        if (confirm && !window.confirm(confirm)) return;
        setLoading(true);
        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast(data.error || "Action failed.", "error");
                return;
            }
            toast(successMessage, "success");
            router.refresh();
        } catch {
            toast("Something went wrong. Try again.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button variant={variant} size={size} onClick={run} disabled={loading}>
            {loading ? "…" : label}
        </Button>
    );
}
