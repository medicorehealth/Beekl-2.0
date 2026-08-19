import { requireAdmin } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Admin panel layout. Server-guarded via requireAdmin — any non-admin role is
 * redirected to /unauthorized. There is NO separate admin login: admins reach
 * here through the unified /login using their normal credentials.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAdmin("/admin");

    return (
        <div className="flex min-h-screen bg-paper-soft">
            <AdminSidebar permissions={user.permissions} />
            <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>
    );
}
