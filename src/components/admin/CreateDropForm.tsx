"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

/** Admin create-drop modal form. */
export function CreateDropForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const releaseAtRaw = String(form.get("releaseAt") || "");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/drops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(form.get("name") || ""),
                    story: String(form.get("story") || ""),
                    bannerImage: String(form.get("bannerImage") || ""),
                    status: String(form.get("status") || "UPCOMING"),
                    releaseAt: releaseAtRaw ? new Date(releaseAtRaw).toISOString() : "",
                }),
            });
            if (!res.ok) throw new Error();
            toast("Drop created.", "success");
            setOpen(false);
            router.refresh();
        } catch {
            toast("Couldn't create drop.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> New drop
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Create a drop"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" form="drop-form" disabled={loading}>
                            {loading ? "Creating…" : "Create"}
                        </Button>
                    </>
                }
            >
                <form id="drop-form" onSubmit={submit} className="space-y-4">
                    <Input name="name" label="Drop name" required />
                    <Textarea name="story" label="Story" rows={3} />
                    <Input name="bannerImage" label="Banner image URL" type="url" placeholder="https://…" />
                    <div className="grid grid-cols-2 gap-3">
                        <Select name="status" label="Status" defaultValue="UPCOMING">
                            <option value="UPCOMING">Upcoming</option>
                            <option value="LIVE">Live</option>
                            <option value="ENDED">Ended</option>
                        </Select>
                        <Input name="releaseAt" label="Release date" type="datetime-local" />
                    </div>
                </form>
            </Modal>
        </>
    );
}
