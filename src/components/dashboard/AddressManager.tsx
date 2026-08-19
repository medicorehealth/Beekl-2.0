"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

export type Address = {
    id: string;
    fullName: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal: string;
    country: string;
    phone: string;
    isDefault: boolean;
};

export function AddressManager({ initial }: { initial: Address[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    async function addAddress(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setLoading(true);
        try {
            const res = await fetch("/api/account/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(form)),
            });
            if (!res.ok) throw new Error();
            toast("Address saved.", "success");
            setOpen(false);
            router.refresh();
        } catch {
            toast("Couldn't save address.", "error");
        } finally {
            setLoading(false);
        }
    }

    async function remove(id: string) {
        try {
            const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast("Address removed.", "success");
            router.refresh();
        } catch {
            toast("Couldn't remove address.", "error");
        }
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Addresses</h2>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Add address
                </Button>
            </div>

            {initial.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {initial.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-grey-200 bg-white p-5">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 font-bold text-ink">
                                    <MapPin className="h-4 w-4 text-grey-400" />
                                    {a.fullName}
                                </span>
                                {a.isDefault && (
                                    <Badge tone="paper">
                                        <Star className="h-3 w-3" /> Default
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-grey-600">
                                {a.line1}
                                {a.line2 ? `, ${a.line2}` : ""}
                                <br />
                                {a.city}, {a.state} {a.postal}
                                <br />
                                {a.country}
                                {a.phone && (
                                    <>
                                        <br />
                                        {a.phone}
                                    </>
                                )}
                            </p>
                            <button
                                onClick={() => remove(a.id)}
                                className="mt-3 flex items-center gap-1 text-xs font-semibold text-flame hover:underline"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<MapPin className="h-6 w-6" />}
                    title="No addresses saved."
                    description="Add an address to speed up checkout."
                />
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Add address"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="address-form" disabled={loading}>
                            {loading ? "Saving…" : "Save"}
                        </Button>
                    </>
                }
            >
                <form id="address-form" onSubmit={addAddress} className="space-y-3">
                    <Input name="fullName" label="Full name" required />
                    <Input name="line1" label="Address line 1" required />
                    <Input name="line2" label="Address line 2 (optional)" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input name="city" label="City" required />
                        <Input name="state" label="State" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input name="postal" label="PIN code" required />
                        <Input name="country" label="Country" defaultValue="India" required />
                    </div>
                    <Input name="phone" label="Phone" placeholder="+91…" />
                </form>
            </Modal>
        </div>
    );
}
