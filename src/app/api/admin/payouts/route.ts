import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-guards";
import type { Prisma } from "@prisma/client";

/**
 * Admin payout management.
 *
 * Creating a payout batches a creator's PAYABLE commissions into a Payout
 * record and marks them PAID (or PENDING payout). We NEVER store raw bank/
 * payment credentials — only an external reference string. Actual money
 * movement happens outside this app via a real payment provider.
 */

const createSchema = z.object({ creatorId: z.string().min(1) });

export async function POST(req: Request) {
    const guard = await requireApiPermission("payouts.manage");
    if (!guard.ok) return guard.response;

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { creatorId } = parsed.data;

    // Gather PAYABLE + APPROVED commissions not yet attached to a payout.
    const payable = await prisma.commission.findMany({
        where: {
            creatorId,
            status: { in: ["APPROVED", "PAYABLE"] },
            payoutId: null,
        },
        select: { id: true, commissionAmount: true, currency: true },
    });

    if (payable.length === 0) {
        return NextResponse.json(
            { error: "No payable commissions for this creator." },
            { status: 409 }
        );
    }

    const amount = payable.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const currency = payable[0].currency;

    const payout = await prisma.$transaction(async (tx) => {
        const p = await tx.payout.create({
            data: {
                creatorId,
                amount: amount as unknown as Prisma.Decimal,
                currency,
                status: "PENDING",
            },
        });
        await tx.commission.updateMany({
            where: { id: { in: payable.map((c) => c.id) } },
            data: { payoutId: p.id, status: "PAYABLE" },
        });
        return p;
    });

    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: "payout.create", target: payout.id },
    });

    return NextResponse.json({ ok: true, payoutId: payout.id, amount });
}

const updateSchema = z.object({
    payoutId: z.string().min(1),
    action: z.enum(["approve", "mark_paid", "fail"]),
    reference: z.string().max(120).optional(),
});

export async function PATCH(req: Request) {
    const guard = await requireApiPermission("payouts.manage");
    if (!guard.ok) return guard.response;

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { payoutId, action, reference } = parsed.data;

    if (action === "mark_paid") {
        await prisma.$transaction([
            prisma.payout.update({
                where: { id: payoutId },
                data: { status: "PAID", paidAt: new Date(), reference: reference ?? null },
            }),
            prisma.commission.updateMany({
                where: { payoutId },
                data: { status: "PAID" },
            }),
        ]);
    } else {
        await prisma.payout.update({
            where: { id: payoutId },
            data: { status: action === "approve" ? "APPROVED" : "FAILED" },
        });
    }

    await prisma.auditLog.create({
        data: { actorId: guard.user.id, action: `payout.${action}`, target: payoutId },
    });
    return NextResponse.json({ ok: true });
}
