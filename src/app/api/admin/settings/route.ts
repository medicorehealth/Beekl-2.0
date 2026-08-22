import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";

/**
 * Admin site-settings management. Guarded by the "settings.manage" permission.
 * Upserts the singleton SiteSettings row so branding, theme, announcement,
 * footer, socials and homepage sections are all editable without code changes.
 */

const navLink = z.object({ label: z.string().min(1).max(60), href: z.string().min(1).max(300) });
const footerColumn = z.object({
    title: z.string().min(1).max(60),
    links: z.array(navLink).max(12),
});
const homeSection = z.object({
    key: z.string().min(1).max(40),
    title: z.string().max(120),
    subtitle: z.string().max(200).optional(),
    enabled: z.boolean(),
    order: z.coerce.number().int().min(0).max(99),
});

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a hex color");

const schema = z.object({
    brandName: z.string().min(1).max(60).optional(),
    tagline: z.string().max(160).optional(),
    description: z.string().max(400).optional(),
    logoUrl: z.string().url().optional().or(z.literal("")),
    accentHoney: hex.optional(),
    accentFlame: hex.optional(),
    announcementActive: z.boolean().optional(),
    announcementText: z.string().max(160).optional(),
    announcementItems: z.array(z.string().max(120)).max(10).optional(),
    heroAutoplayMs: z.coerce.number().int().min(2500).max(20000).optional(),
    footerDescription: z.string().max(400).optional(),
    footerTagline: z.string().max(160).optional(),
    footerNote: z.string().max(500).optional(),
    copyrightText: z.string().max(160).optional(),
    newsletterEnabled: z.boolean().optional(),
    footerColumns: z.array(footerColumn).max(6).optional(),
    socialLinks: z.array(navLink).max(10).optional(),
    homepageSections: z.array(homeSection).max(40).optional(),
});

export async function GET() {
    const guard = await requireApiPermission("settings.manage");
    if (!guard.ok) return guard.response;

    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("settings.manage");
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.errors[0]?.message || "Invalid settings." },
            { status: 400 }
        );
    }

    const d = parsed.data;
    const data: Record<string, unknown> = { ...d };
    if ("logoUrl" in data && data.logoUrl === "") data.logoUrl = null;

    const settings = await prisma.siteSettings.upsert({
        where: { id: "singleton" },
        create: { id: "singleton", ...data },
        update: data,
    });

    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: "settings.update", target: "singleton" },
    });

    return NextResponse.json({ ok: true, settings });
}
