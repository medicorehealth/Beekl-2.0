import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AccountShell } from "@/components/dashboard/AccountNav";
import { AddressManager } from "@/components/dashboard/AddressManager";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
    const user = await requireUser("/account/addresses");
    const addresses = await safe(
        () =>
            prisma.address.findMany({
                where: { userId: user.id },
                orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
            }),
        []
    );

    return (
        <AccountShell title="My Account" subtitle="Manage your delivery addresses.">
            <AddressManager
                initial={addresses.map((a) => ({
                    id: a.id,
                    fullName: a.fullName,
                    line1: a.line1,
                    line2: a.line2 ?? "",
                    city: a.city,
                    state: a.state,
                    postal: a.postal,
                    country: a.country,
                    phone: a.phone ?? "",
                    isDefault: a.isDefault,
                }))}
            />
        </AccountShell>
    );
}
