import "server-only";
import { prisma } from "@/lib/db";
import { getAdminOrder } from "@/lib/shopify/admin";
import { parseShopifyId } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

/**
 * Commission engine — SERVER-SIDE ONLY.
 *
 * Given a Shopify order, we attribute each line item to a BeeKL
 * ProductReference (and therefore a Creator), then compute the creator's
 * commission using the creator's configured rate (basis points). We store the
 * result in the Commission ledger. All math happens here — never on the client,
 * never fabricated. If the Admin API isn't configured we cannot attribute the
 * sale and we say so explicitly.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

export type CommissionComputation = {
    ok: boolean;
    message?: string;
    created: number;
};

/**
 * Process a Shopify order into the commission ledger. Idempotent per order:
 * re-running will skip if commissions already exist for that OrderReference.
 */
export async function processOrderCommissions(
    shopifyOrderId: string
): Promise<CommissionComputation> {
    const order = await getAdminOrder(shopifyOrderId);
    if (!order) {
        return {
            ok: false,
            created: 0,
            message:
                "Shopify Admin API is not connected, so this order cannot be attributed for commissions.",
        };
    }

    // Upsert an OrderReference for BeeKL-native workflows.
    const orderRef = await prisma.orderReference.upsert({
        where: { shopifyOrderId: order.id },
        create: {
            shopifyOrderId: order.id,
            orderNumber: order.name,
            email: order.email,
            currency: order.currencyCode,
            totalAmount: order.totalPrice as unknown as Prisma.Decimal,
            processedAt: order.processedAt ? new Date(order.processedAt) : null,
        },
        update: {
            orderNumber: order.name,
            totalAmount: order.totalPrice as unknown as Prisma.Decimal,
        },
    });

    // Idempotency: don't double-create.
    const existing = await prisma.commission.count({
        where: { orderReferenceId: orderRef.id },
    });
    if (existing > 0) {
        return { ok: true, created: 0, message: "Commissions already processed." };
    }

    let created = 0;

    for (const line of order.lineItems) {
        if (!line.productId) continue;

        // Attribute the line to a BeeKL ProductReference by Shopify product GID.
        const productRef = await prisma.productReference.findFirst({
            where: {
                OR: [
                    { shopifyProductId: line.productId },
                    { shopifyProductId: parseShopifyId(line.productId) },
                ],
            },
            include: { creator: true },
        });

        if (!productRef?.creatorId || !productRef.creator) continue;

        const rateBps = productRef.creator.commissionRateBps ?? 1500;
        const gross = round2(parseFloat(line.price) * line.quantity);
        // Deductions (POD base cost etc.) are unknown until a POD provider is
        // connected; default to 0 and let finance adjust. We never invent a number.
        const deductions = 0;
        const base = Math.max(gross - deductions, 0);
        const commissionAmount = round2((base * rateBps) / 10000);
        const beeklShare = round2(base - commissionAmount);

        await prisma.commission.create({
            data: {
                orderReferenceId: orderRef.id,
                productReferenceId: productRef.id,
                creatorId: productRef.creatorId,
                grossAmount: gross as unknown as Prisma.Decimal,
                deductions: deductions as unknown as Prisma.Decimal,
                commissionRateBps: rateBps,
                commissionAmount: commissionAmount as unknown as Prisma.Decimal,
                beeklShare: beeklShare as unknown as Prisma.Decimal,
                currency: order.currencyCode,
                status: "PENDING",
            },
        });
        created += 1;
    }

    return {
        ok: true,
        created,
        message:
            created === 0
                ? "No creator-attributed line items found in this order."
                : `Created ${created} commission entr${created === 1 ? "y" : "ies"}.`,
    };
}

/** Aggregate a creator's commission totals by status. */
export async function getCreatorCommissionSummary(creatorId: string) {
    const grouped = await prisma.commission.groupBy({
        by: ["status"],
        where: { creatorId },
        _sum: { commissionAmount: true },
        _count: { _all: true },
    });

    const summary: Record<string, { amount: number; count: number }> = {
        PENDING: { amount: 0, count: 0 },
        APPROVED: { amount: 0, count: 0 },
        PAYABLE: { amount: 0, count: 0 },
        PAID: { amount: 0, count: 0 },
        CANCELLED: { amount: 0, count: 0 },
    };

    for (const g of grouped) {
        summary[g.status] = {
            amount: Number(g._sum.commissionAmount ?? 0),
            count: g._count._all,
        };
    }
    return summary;
}
