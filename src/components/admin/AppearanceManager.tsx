"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Save,
    Plus,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Palette,
    Megaphone,
    LayoutTemplate,
    PanelBottom,
    Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type {
    SiteSettings,
    FooterColumn,
    NavLink,
    HomeSection,
} from "@/lib/settings";

type Tab = "branding" | "announcement" | "homepage" | "footer" | "social";

/** Full site-appearance editor. Everything here writes to SiteSettings. */
export function AppearanceManager({ initial }: { initial: SiteSettings }) {
    const router = useRouter();
    const { toast } = useToast();
    const [tab, setTab] = React.useState<Tab>("branding");
    const [saving, setSaving] = React.useState(false);
    const [s, setS] = React.useState<SiteSettings>(initial);

    function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
        setS((prev) => ({ ...prev, [key]: value }));
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(s),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast(data.error || "Couldn't save settings.", "error");
                return;
            }
            toast("Saved. Changes are live.", "success");
            router.refresh();
        } catch {
            toast("Something went wrong. Try again.", "error");
        } finally {
            setSaving(false);
        }
    }

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "branding", label: "Branding & Theme", icon: <Palette className="h-4 w-4" /> },
        { key: "announcement", label: "Announcement", icon: <Megaphone className="h-4 w-4" /> },
        { key: "homepage", label: "Homepage", icon: <LayoutTemplate className="h-4 w-4" /> },
        { key: "footer", label: "Footer", icon: <PanelBottom className="h-4 w-4" /> },
        { key: "social", label: "Social Links", icon: <Share2 className="h-4 w-4" /> },
    ];

    return (
        <div>
            {/* Sticky action bar */}
            <div className="sticky top-0 z-10 -mx-5 mb-6 flex items-center justify-between border-b border-grey-200 bg-paper-soft/80 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
                <div className="flex flex-wrap gap-1.5">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={
                                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors " +
                                (tab === t.key
                                    ? "bg-ink text-paper"
                                    : "text-grey-500 hover:bg-grey-100 hover:text-ink")
                            }
                        >
                            {t.icon}
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>
                <Button onClick={save} disabled={saving}>
                    <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </Button>
            </div>

            <div className="max-w-3xl space-y-6">
                {tab === "branding" && <BrandingTab s={s} set={set} />}
                {tab === "announcement" && <AnnouncementTab s={s} set={set} />}
                {tab === "homepage" && (
                    <HomepageTab
                        sections={s.homepageSections}
                        onChange={(next) => set("homepageSections", next)}
                    />
                )}
                {tab === "footer" && <FooterTab s={s} set={set} />}
                {tab === "social" && (
                    <SocialTab
                        links={s.socialLinks}
                        onChange={(next) => set("socialLinks", next)}
                    />
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-grey-200 bg-white p-6">
            <h2 className="font-bold text-ink">{title}</h2>
            {desc && <p className="mb-4 mt-0.5 text-sm text-grey-500">{desc}</p>}
            <div className={desc ? "space-y-4" : "mt-4 space-y-4"}>{children}</div>
        </div>
    );
}

type SetFn = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;

function BrandingTab({ s, set }: { s: SiteSettings; set: SetFn }) {
    return (
        <>
            <Card title="Brand" desc="Your name, tagline and logo.">
                <Input label="Brand name" value={s.brandName} onChange={(e) => set("brandName", e.target.value)} />
                <Input label="Tagline" value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
                <Textarea label="Description" rows={2} value={s.description} onChange={(e) => set("description", e.target.value)} />
                <Input label="Logo URL (optional)" value={s.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
            </Card>

            <Card title="Theme accents" desc="Bold accent colours used across the store.">
                <div className="grid grid-cols-2 gap-4">
                    <ColorField label="Honey (primary accent)" value={s.accentHoney} onChange={(v) => set("accentHoney", v)} />
                    <ColorField label="Flame (secondary accent)" value={s.accentFlame} onChange={(v) => set("accentFlame", v)} />
                </div>
                <div className="flex gap-3 pt-2">
                    <span className="flex-1 rounded-xl px-4 py-3 text-center text-sm font-bold text-ink" style={{ background: s.accentHoney }}>
                        Honey preview
                    </span>
                    <span className="flex-1 rounded-xl px-4 py-3 text-center text-sm font-bold text-white" style={{ background: s.accentFlame }}>
                        Flame preview
                    </span>
                </div>
            </Card>

            <Card title="Hero carousel" desc="How fast the homepage banners auto-slide.">
                <Input
                    type="number"
                    label="Autoplay interval (ms)"
                    value={String(s.heroAutoplayMs)}
                    onChange={(e) => set("heroAutoplayMs", Number(e.target.value) || 6000)}
                />
                <p className="text-xs text-grey-400">2500–20000 ms. Default 6000 (6 seconds).</p>
            </Card>
        </>
    );
}

function AnnouncementTab({ s, set }: { s: SiteSettings; set: SetFn }) {
    return (
        <Card title="Announcement bar" desc="The thin strip at the very top of the site.">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" checked={s.announcementActive} onChange={(e) => set("announcementActive", e.target.checked)} className="h-4 w-4" />
                Show announcement bar
            </label>
            <Input label="Main message (desktop)" value={s.announcementText} onChange={(e) => set("announcementText", e.target.value)} />
            <Textarea
                label="Rotating messages (mobile) — one per line"
                rows={4}
                value={s.announcementItems.join("\n")}
                onChange={(e) =>
                    set(
                        "announcementItems",
                        e.target.value.split("\n").map((x) => x.trim()).filter(Boolean)
                    )
                }
            />
        </Card>
    );
}

function HomepageTab({
    sections,
    onChange,
}: {
    sections: HomeSection[];
    onChange: (next: HomeSection[]) => void;
}) {
    function update(i: number, patch: Partial<HomeSection>) {
        onChange(sections.map((sec, idx) => (idx === i ? { ...sec, ...patch } : sec)));
    }
    function move(i: number, dir: -1 | 1) {
        const j = i + dir;
        if (j < 0 || j >= sections.length) return;
        const next = [...sections];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next.map((sec, idx) => ({ ...sec, order: idx })));
    }

    return (
        <Card title="Homepage sections" desc="Toggle, reorder and rename each block. Changes appear on the homepage instantly.">
            <div className="space-y-3">
                {sections.map((sec, i) => (
                    <div key={sec.key} className="rounded-xl border border-grey-200 bg-paper-soft p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <button onClick={() => move(i, -1)} className="text-grey-400 hover:text-ink disabled:opacity-30" disabled={i === 0} aria-label="Move up">▲</button>
                                    <button onClick={() => move(i, 1)} className="text-grey-400 hover:text-ink disabled:opacity-30" disabled={i === sections.length - 1} aria-label="Move down">▼</button>
                                </div>
                                <span className="text-[11px] font-mono uppercase tracking-wide text-grey-400">{sec.key}</span>
                            </div>
                            <button
                                onClick={() => update(i, { enabled: !sec.enabled })}
                                className={
                                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " +
                                    (sec.enabled ? "bg-success/10 text-success" : "bg-grey-100 text-grey-400")
                                }
                            >
                                {sec.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                {sec.enabled ? "Visible" : "Hidden"}
                            </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input label="Title" value={sec.title} onChange={(e) => update(i, { title: e.target.value })} />
                            <Input label="Subtitle / kicker" value={sec.subtitle ?? ""} onChange={(e) => update(i, { subtitle: e.target.value })} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function FooterTab({ s, set }: { s: SiteSettings; set: SetFn }) {
    function updateColumn(i: number, patch: Partial<FooterColumn>) {
        set("footerColumns", s.footerColumns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
    }
    function updateLink(ci: number, li: number, patch: Partial<NavLink>) {
        const col = s.footerColumns[ci];
        const links = col.links.map((l, idx) => (idx === li ? { ...l, ...patch } : l));
        updateColumn(ci, { links });
    }
    function addLink(ci: number) {
        updateColumn(ci, { links: [...s.footerColumns[ci].links, { label: "New link", href: "/" }] });
    }
    function removeLink(ci: number, li: number) {
        updateColumn(ci, { links: s.footerColumns[ci].links.filter((_, idx) => idx !== li) });
    }
    function addColumn() {
        set("footerColumns", [...s.footerColumns, { title: "New column", links: [] }]);
    }
    function removeColumn(ci: number) {
        set("footerColumns", s.footerColumns.filter((_, idx) => idx !== ci));
    }

    return (
        <>
            <Card title="Footer copy" desc="Brand blurb, tagline, legal note and copyright.">
                <Textarea label="Footer description" rows={2} value={s.footerDescription} onChange={(e) => set("footerDescription", e.target.value)} />
                <Input label="Footer tagline" value={s.footerTagline} onChange={(e) => set("footerTagline", e.target.value)} />
                <Textarea label="Legal note" rows={2} value={s.footerNote} onChange={(e) => set("footerNote", e.target.value)} />
                <Input label="Copyright text" value={s.copyrightText} onChange={(e) => set("copyrightText", e.target.value)} />
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <input type="checkbox" checked={s.newsletterEnabled} onChange={(e) => set("newsletterEnabled", e.target.checked)} className="h-4 w-4" />
                    Show newsletter signup
                </label>
            </Card>

            <Card title="Footer link columns" desc="Organize the footer navigation.">
                <div className="space-y-4">
                    {s.footerColumns.map((col, ci) => (
                        <div key={ci} className="rounded-xl border border-grey-200 bg-paper-soft p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <Input
                                    className="flex-1"
                                    value={col.title}
                                    onChange={(e) => updateColumn(ci, { title: e.target.value })}
                                    placeholder="Column title"
                                />
                                <button onClick={() => removeColumn(ci)} className="rounded-lg p-2 text-grey-400 hover:bg-grey-100 hover:text-flame" aria-label="Remove column">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {col.links.map((l, li) => (
                                    <div key={li} className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 shrink-0 text-grey-300" />
                                        <input
                                            value={l.label}
                                            onChange={(e) => updateLink(ci, li, { label: e.target.value })}
                                            placeholder="Label"
                                            className="w-1/2 rounded-lg border border-grey-200 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                                        />
                                        <input
                                            value={l.href}
                                            onChange={(e) => updateLink(ci, li, { href: e.target.value })}
                                            placeholder="/link"
                                            className="flex-1 rounded-lg border border-grey-200 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                                        />
                                        <button onClick={() => removeLink(ci, li)} className="rounded-lg p-2 text-grey-400 hover:bg-grey-100 hover:text-flame" aria-label="Remove link">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addLink(ci)} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-flame">
                                <Plus className="h-4 w-4" /> Add link
                            </button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" onClick={addColumn}>
                    <Plus className="h-4 w-4" /> Add column
                </Button>
            </Card>
        </>
    );
}

function SocialTab({
    links,
    onChange,
}: {
    links: NavLink[];
    onChange: (next: NavLink[]) => void;
}) {
    function update(i: number, patch: Partial<NavLink>) {
        onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
    }
    return (
        <Card title="Social links" desc="Shown in the footer and the homepage social section.">
            <div className="space-y-2">
                {links.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            value={l.label}
                            onChange={(e) => update(i, { label: e.target.value })}
                            placeholder="Instagram"
                            className="w-1/3 rounded-lg border border-grey-200 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                        />
                        <input
                            value={l.href}
                            onChange={(e) => update(i, { href: e.target.value })}
                            placeholder="https://instagram.com/beekl"
                            className="flex-1 rounded-lg border border-grey-200 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                        />
                        <button onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-grey-400 hover:bg-grey-100 hover:text-flame" aria-label="Remove">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
            <Button variant="outline" onClick={() => onChange([...links, { label: "New", href: "https://" }])}>
                <Plus className="h-4 w-4" /> Add social link
            </Button>
        </Card>
    );
}

function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-grey-200"
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 rounded-lg border border-grey-200 px-3 py-2 font-mono text-sm focus:border-ink focus:outline-none"
                />
            </div>
        </div>
    );
}
