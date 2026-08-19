"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

export type BannerRow = {
    id: string;
    title: string;
    subtitle: string | null;
    desktopImage: string;
    mobileImage: string | null;
    primaryButtonText: string | null;
    primaryButtonLink: string | null;
    secondaryButtonText: string | null;
    secondaryButtonLink: string | null;
    displayOrder: number;
    isActive: boolean;
};

export function BannerManager({ initial }: { initial: BannerRow[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [editing, setEditing] = React.useState<BannerRow | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [draft, setDraft] = React.useState<Partial<BannerRow>>({});
    const active = creating ? draft : editing ?? {};

    function openCreate() {
        setDraft({ title: "", desktopImage: "", displayOrder: initial.length, isActive: true });
        setCreating(true);
    }
    function openEdit(b: BannerRow) {
        setDraft(b);
        setEditing(b);
    }
    function close() {
        setCreating(false);
        setEditing(null);
        setDraft({});
    }

    async function save() {
        setLoading(true);
        try {
            const method = creating ? "POST" : "PATCH";
            const body = creating ? draft : { ...draft, id: editing?.id };
            const res = await fetch("/api/admin/banners", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            toast(creating ? "Banner created." : "Banner updated.", "success");
            close();
            router.refresh();
        } catch {
            toast("Couldn't save banner. Check the image URL.", "error");
        } finally {
            setLoading(false);
        }
    }

    async function toggleActive(b: BannerRow) {
        try {
            const res = await fetch("/api/admin/banners", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: b.id, isActive: !b.isActive }),
            });
            if (!res.ok) throw new Error();
            router.refresh();
        } catch {
            toast("Couldn't update.", "error");
        }
    }

    async function remove(id: string) {
        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast("Banner deleted.", "success");
            router.refresh();
        } catch {
            toast("Couldn't delete.", "error");
        }
    }

    const modalOpen = creating || editing !== null;

    return (
        <div>
            <div className="mb-6 flex justify-end">
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> New banner
                </Button>
            </div>

            {initial.length === 0 ? (
                <EmptyState
                    title="No banners yet."
                    description="Create your first homepage hero banner. It appears instantly on the homepage."
                />
            ) : (
                <div className="space-y-3">
                    {initial.map((b) => (
                        <div
                            key={b.id}
                            className="flex flex-col gap-4 rounded-2xl border border-grey-200 bg-white p-4 sm:flex-row sm:items-center"
                        >
                            <GripVertical className="hidden h-5 w-5 text-grey-300 sm:block" />
                            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-grey-100">
                                {b.desktopImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={b.desktopImage} alt={b.title} className="h-full w-full object-cover" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate font-bold text-ink">{b.title}</h3>
                                    <Badge tone={b.isActive ? "success" : "neutral"}>
                                        {b.isActive ? "Active" : "Hidden"}
                                    </Badge>
                                </div>
                                {b.subtitle && (
                                    <p className="truncate text-sm text-grey-500">{b.subtitle}</p>
                                )}
                                <p className="text-xs text-grey-400">Order: {b.displayOrder}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <IconBtn onClick={() => toggleActive(b)} title={b.isActive ? "Hide" : "Show"}>
                                    {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </IconBtn>
                                <IconBtn onClick={() => openEdit(b)} title="Edit">
                                    <Pencil className="h-4 w-4" />
                                </IconBtn>
                                <IconBtn onClick={() => remove(b.id)} title="Delete" danger>
                                    <Trash2 className="h-4 w-4" />
                                </IconBtn>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={close}
                title={creating ? "New banner" : "Edit banner"}
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={close}>
                            Cancel
                        </Button>
                        <Button onClick={save} disabled={loading}>
                            {loading ? "Saving…" : "Save banner"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Live preview */}
                    <div className="relative flex min-h-[160px] items-end overflow-hidden rounded-xl bg-ink">
                        {active.desktopImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={active.desktopImage}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-paper/40">
                                Preview — add a desktop image URL
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                        <div className="relative z-10 p-5">
                            <h3 className="font-display text-xl font-bold text-paper">
                                {active.title || "Banner title"}
                            </h3>
                            {active.subtitle && <p className="text-sm text-paper/70">{active.subtitle}</p>}
                            {active.primaryButtonText && (
                                <span className="mt-2 inline-block rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">
                                    {active.primaryButtonText}
                                </span>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Title"
                        value={active.title ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    />
                    <Textarea
                        label="Subtitle"
                        rows={2}
                        value={active.subtitle ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                            label="Desktop image URL"
                            value={active.desktopImage ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, desktopImage: e.target.value }))}
                        />
                        <Input
                            label="Mobile image URL"
                            value={active.mobileImage ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, mobileImage: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                            label="Primary button text"
                            value={active.primaryButtonText ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, primaryButtonText: e.target.value }))}
                        />
                        <Input
                            label="Primary button link"
                            value={active.primaryButtonLink ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, primaryButtonLink: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                            label="Secondary button text"
                            value={active.secondaryButtonText ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, secondaryButtonText: e.target.value }))}
                        />
                        <Input
                            label="Secondary button link"
                            value={active.secondaryButtonLink ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, secondaryButtonLink: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            label="Display order"
                            value={String(active.displayOrder ?? 0)}
                            onChange={(e) => setDraft((d) => ({ ...d, displayOrder: Number(e.target.value) }))}
                        />
                        <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-ink">
                            <input
                                type="checkbox"
                                checked={active.isActive ?? true}
                                onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
                                className="h-4 w-4"
                            />
                            Active
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function IconBtn({
    children,
    onClick,
    title,
    danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={
                "flex h-9 w-9 items-center justify-center rounded-lg text-grey-500 hover:bg-grey-100 " +
                (danger ? "hover:text-flame" : "hover:text-ink")
            }
        >
            {children}
        </button>
    );
}
