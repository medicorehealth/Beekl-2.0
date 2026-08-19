import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";

/** Admin community management: approve / suspend / feature. */
const schema = z.object({
    communityId: z.string().min(1),
    action: z.enum(["approve", "suspend", "restore", "feature", "unfeature"]),
});

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("communities.manage");
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { communityId, action } = parsed.data;

    const data: Record<string, unknown> = {};
    if (action === "approve" || action === "restore") data.status = "APPROVED";
    if (action === "suspend") data.status = "SUSPENDED";
    if (action === "feature") data.isFeatured = true;
    if (action === "unfeature") data.isFeatured = false;

    await prisma.community.update({ where: { id: communityId }, data });
    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: `community.${action}`, target: communityId },
    });
    return NextResponse.json({ ok: true });
}
