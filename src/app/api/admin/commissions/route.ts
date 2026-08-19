import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";
import { processOrderCommissions } from "@/lib/commissions";

/**
 * Admin commission management. Transition commission status through the ledger
 * lifecycle (PENDING → APPROVED → PAYABLE → PAID / CANCELLED). All amounts were
 * computed server-side by the commission engine — this only moves status.
 *
 * Also supports processing a Shopify order into commissions (idempotent).
 */

const statusSchema = z.object({
    commissionId: z.string().min(1),
    action: z.enum(["approve", "mark_payable", "cancel"]),
});

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("commissions.manage");
    if (!guard.ok) return guard.response;

    const parsed = statusSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { commissionId, action } = parsed.data;

    const status =
        action === "approve" ? "APPROVED" : action === "mark_payable" ? "PAYABLE" : "CANCELLED";

    await prisma.commission.update({ where: { id: commissionId }, data: { status } });
    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: `commission.${action}`, target: commissionId },
    });
    return NextResponse.json({ ok: true });
}

const processSchema = z.object({ shopifyOrderId: z.string().min(1) });

export async function POST(req: Request) {
    const guard = await requireApiPermission("commissions.manage");
    if (!guard.ok) return guard.response;

    const parsed = processSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const result = await processOrderCommissions(parsed.data.shopifyOrderId);
    return NextResponse.json(result);
}
