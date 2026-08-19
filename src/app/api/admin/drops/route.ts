import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";
import { slugify } from "@/lib/utils";

/** Admin drop management: create / update status / feature. */

const createSchema = z.object({
    name: z.string().min(2).max(120),
    story: z.string().max(2000).optional(),
    bannerImage: z.string().url().optional().or(z.literal("")),
    status: z.enum(["UPCOMING", "LIVE", "ENDED"]).default("UPCOMING"),
    releaseAt: z.string().datetime().optional().or(z.literal("")),
});

export async function POST(req: Request) {
    const guard = await requireApiPermission("drops.manage");
    if (!guard.ok) return guard.response;

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid drop data." }, { status: 400 });
    }
    const d = parsed.data;

    const base = slugify(d.name) || "drop";
    let slug = base;
    let n = 1;
    while (await prisma.drop.findUnique({ where: { slug } })) slug = `${base}-${n++}`;

    const drop = await prisma.drop.create({
        data: {
            slug,
            name: d.name,
            story: d.story || null,
            bannerImage: d.bannerImage || null,
            status: d.status,
            releaseAt: d.releaseAt ? new Date(d.releaseAt) : null,
        },
    });
    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: "drop.create", target: drop.id },
    });
    return NextResponse.json({ ok: true, drop });
}

const updateSchema = z.object({
    dropId: z.string().min(1),
    action: z.enum(["publish", "feature", "unfeature", "end", "schedule"]),
});

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("drops.manage");
    if (!guard.ok) return guard.response;

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { dropId, action } = parsed.data;

    const data: Record<string, unknown> = {};
    if (action === "publish") data.status = "LIVE";
    if (action === "end") data.status = "ENDED";
    if (action === "schedule") data.status = "UPCOMING";
    if (action === "feature") data.isFeatured = true;
    if (action === "unfeature") data.isFeatured = false;

    await prisma.drop.update({ where: { id: dropId }, data });
    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: `drop.${action}`, target: dropId },
    });
    return NextResponse.json({ ok: true });
}
