import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AccountShell } from "@/components/dashboard/AccountNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { roleLabel } from "@/lib/rbac";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default async function AccountPage() {
    const sessionUser = await requireUser("/account");
    const user = await safe(
        () =>
            prisma.user.findUnique({
                where: { id: sessionUser.id },
                select: { name: true, email: true, phone: true, role: true, createdAt: true },
            }),
        null
    );

    return (
        <AccountShell title="My Account" subtitle="Manage your BeeKL profile.">
            <Card>
                <CardContent className="pt-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-ink">Profile</h2>
                        {user && <Badge tone="paper">{roleLabel(user.role)}</Badge>}
                    </div>
                    {user ? (
                        <ProfileForm
                            initial={{
                                name: user.name ?? "",
                                phone: user.phone ?? "",
                                email: user.email,
                            }}
                        />
                    ) : (
                        <p className="text-sm text-grey-500">Couldn&apos;t load your profile.</p>
                    )}
                </CardContent>
            </Card>
        </AccountShell>
    );
}
