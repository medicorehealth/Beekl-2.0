"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

/** Contest entry form. Only usable when a contest is OPEN and user is signed in. */
export function ContestEntryForm({ contestId }: { contestId: string }) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        const title = String(form.get("title") || "");
        const description = String(form.get("description") || "");
        const imageUrl = String(form.get("imageUrl") || "");

        setLoading(true);
        try {
            const res = await fetch("/api/contest/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contestId,
                    title,
                    description,
                    images: imageUrl ? [imageUrl] : [],
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not submit. Try again.");
                return;
            }
            toast("Idea submitted! Good luck 🍀", "success");
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
            <Button
                variant="accent"
                size="lg"
                onClick={() => {
                    if (!session?.user) {
                        toast("Sign in to submit your idea.", "info");
                        return;
                    }
                    setOpen(true);
                }}
            >
                Submit Your Idea
            </Button>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Submit your idea"
                description="Original ideas only. If the community loves it, we'll make it a real drop."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="contest-entry" disabled={loading}>
                            {loading ? "Submitting…" : "Submit"}
                        </Button>
                    </>
                }
            >
                <form id="contest-entry" onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    )}
                    <Input name="title" label="Idea title" placeholder="e.g. 'Monday Delulu' tee" required />
                    <Textarea
                        name="description"
                        label="Describe it"
                        placeholder="What's the vibe? Why should this exist?"
                        rows={4}
                    />
                    <Input
                        name="imageUrl"
                        label="Reference image URL (optional)"
                        placeholder="https://…"
                        type="url"
                        hint="Link to a mockup or reference. Must be your own or license-free."
                    />
                </form>
            </Modal>
        </>
    );
}
