import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";

/** Admin banner management. Guarded by the "banners.manage" permission. */

const bannerSchema = z.object({
    title: z.string().min(1).max(160),
    subtitle: z.string().max(300).optional().or(z.literal("")),
    desktopImage: z.string().url(),
    mobileImage: z.string().url().optional().or(z.literal("")),
    primaryButtonText: z.string().max(40).optional().or(z.literal("")),
    primaryButtonLink: z.string().max(300).optional().or(z.literal("")),
    secondaryButtonText: z.string().max(40).optional().or(z.literal("")),
    secondaryButtonLink: z.string().max(300).optional().or(z.literal("")),
    displayOrder: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    startDate: z.string().datetime().optional().or(z.literal("")),
    endDate: z.string().datetime().optional().or(z.literal("")),
});

export async function GET() {
    const guard = await requireApiPermission("banners.manage");
    if (!guard.ok) return guard.response;

    const banners = await prisma.banner.findMany({ orderBy: { displayOrder: "asc" } });
    return NextResponse.json({ banners });
}

export async function POST(req: Request) {
    const guard = await requireApiPermission("banners.manage");
    if (!guard.ok) return guard.response;

    const parsed = bannerSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid banner data." }, { status: 400 });
    }
    const d = parsed.data;

    const banner = await prisma.banner.create({
        data: {
            title: d.title,
            subtitle: d.subtitle || null,
            desktopImage: d.desktopImage,
            mobileImage: d.mobileImage || null,
            primaryButtonText: d.primaryButtonText || null,
            primaryButtonLink: d.primaryButtonLink || null,
            secondaryButtonText: d.secondaryButtonText || null,
            secondaryButtonLink: d.secondaryButtonLink || null,
            displayOrder: d.displayOrder,
            isActive: d.isActive,
            startDate: d.startDate ? new Date(d.startDate) : null,
            endDate: d.endDate ? new Date(d.endDate) : null,
        },
    });

    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: "banner.create", target: banner.id },
    });

    return NextResponse.json({ ok: true, banner });
}

const updateSchema = bannerSchema.partial().extend({ id: z.string().min(1) });

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("banners.manage");
    if (!guard.ok) return guard.response;

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid banner data." }, { status: 400 });
    }
    const { id, startDate, endDate, ...rest } = parsed.data;

    const data: Record<string, unknown> = { ...rest };
    // Normalize optional empties to null.
    for (const key of [
        "subtitle",
        "mobileImage",
        "primaryButtonText",
        "primaryButtonLink",
        "secondaryButtonText",
        "secondaryButtonLink",
    ]) {
        if (key in data && data[key] === "") data[key] = null;
    }
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

    const banner = await prisma.banner.update({ where: { id }, data });
    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: "banner.update", target: id },
    });
    return NextResponse.json({ ok: true, banner });
}

export async function DELETE(req: Request) {
    const guard = await requireApiPermission("banners.manage");
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    await prisma.banner.delete({ where: { id } });
    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: "banner.delete", target: id },
    });
    return NextResponse.json({ ok: true });
}
