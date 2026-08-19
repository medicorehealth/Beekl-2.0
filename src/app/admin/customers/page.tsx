import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { roleLabel } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Customers", robots: { index: false } };

export default async function AdminCustomersPage() {
    await requirePermission("customers.view", "/admin/customers");

    const users = await safe(
        () =>
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                take: 100,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Customers" subtitle="All BeeKL accounts." />
            {users.length === 0 ? (
                <EmptyState title="No users yet." description="Registered users appear here." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-grey-100 bg-paper-soft text-left text-xs uppercase tracking-wide text-grey-500">
                            <tr>
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-paper-soft/50">
                                    <td className="px-5 py-3 font-semibold text-ink">{u.name ?? "—"}</td>
                                    <td className="px-5 py-3 text-grey-500">{u.email}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={u.role === "CUSTOMER" ? "neutral" : "info"}>
                                            {roleLabel(u.role)}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-grey-500">{formatDate(u.createdAt)}</td>
                                    <td className="px-5 py-3">
                                        <Badge tone={u.isActive ? "success" : "danger"}>
                                            {u.isActive ? "Active" : "Disabled"}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
