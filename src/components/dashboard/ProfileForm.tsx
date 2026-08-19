"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

/** Update the user's own profile (name/phone). Email is read-only here. */
export function ProfileForm({
    initial,
}: {
    initial: { name: string; phone: string; email: string };
}) {
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setLoading(true);
        try {
            const res = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(form.get("name") || ""),
                    phone: String(form.get("phone") || ""),
                }),
            });
            if (!res.ok) throw new Error();
            toast("Profile updated.", "success");
        } catch {
            toast("Couldn't update profile.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="max-w-md space-y-4">
            <Input name="name" label="Name" defaultValue={initial.name} required />
            <Input name="phone" label="Phone" defaultValue={initial.phone} placeholder="+91…" />
            <Input
                label="Email"
                value={initial.email}
                disabled
                hint="Email can't be changed here. Contact support if needed."
            />
            <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
            </Button>
        </form>
    );
}
