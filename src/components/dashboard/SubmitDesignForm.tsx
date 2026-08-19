"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

/** Creator design submission form. Posts to /api/creator/submissions. */
export function SubmitDesignForm({
    communities,
}: {
    communities: { id: string; name: string }[];
}) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        setLoading(true);
        try {
            const res = await fetch("/api/creator/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: String(form.get("title") || ""),
                    description: String(form.get("description") || ""),
                    category: String(form.get("category") || ""),
                    communityId: String(form.get("communityId") || "") || undefined,
                    imageUrl: String(form.get("imageUrl") || ""),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not submit.");
                return;
            }
            toast("Design submitted for review.", "success");
            setOpen(false);
            router.refresh();
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button onClick={() => setOpen(true)}>Submit a design</Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Submit a design"
                description="Send BeeKL a new merch idea. Original / licensed art only."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="design-form" disabled={loading}>
                            {loading ? "Submitting…" : "Submit"}
                        </Button>
                    </>
                }
            >
                <form id="design-form" onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    )}
                    <Input name="title" label="Design title" required />
                    <Textarea name="description" label="Description" rows={3} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input name="category" label="Category" placeholder="e.g. Tee, Hoodie" />
                        {communities.length > 0 && (
                            <Select name="communityId" label="Community">
                                <option value="">General</option>
                                {communities.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                    <Input
                        name="imageUrl"
                        label="Reference image URL"
                        type="url"
                        placeholder="https://…"
                        hint="Your own artwork or a license-free reference."
                    />
                </form>
            </Modal>
        </>
    );
}
