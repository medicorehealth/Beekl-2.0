import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { hasPermission, isAdminRole, type Permission } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export type SessionUser = {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role: Role;
    permissions: string[];
    creatorId?: string | null;
};

/** Get the current session user (or null). Server-only. */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return session.user as SessionUser;
}

/** Require an authenticated user, else redirect to /login. */
export async function requireUser(callbackUrl?: string): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user) {
        const cb = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
        redirect(`/login${cb}`);
    }
    return user;
}

/** Require a permission, else redirect to an unauthorized page. */
export async function requirePermission(
    permission: Permission,
    callbackUrl?: string
): Promise<SessionUser> {
    const user = await requireUser(callbackUrl);
    if (!hasPermission(user.role, permission, user.permissions)) {
        redirect("/unauthorized");
    }
    return user;
}

/** Require admin-panel access (any admin role). */
export async function requireAdmin(callbackUrl = "/admin"): Promise<SessionUser> {
    const user = await requireUser(callbackUrl);
    if (!isAdminRole(user.role)) {
        redirect("/unauthorized");
    }
    return user;
}

/** Require the CREATOR (or higher) capability. */
export async function requireCreator(callbackUrl = "/creator"): Promise<SessionUser> {
    const user = await requireUser(callbackUrl);
    const ok =
        hasPermission(user.role, "creator.dashboard", user.permissions) ||
        isAdminRole(user.role);
    if (!ok) redirect("/unauthorized");
    return user;
}

/** Non-throwing permission check for conditional UI on the server. */
export function can(
    user: SessionUser | null,
    permission: Permission
): boolean {
    if (!user) return false;
    return hasPermission(user.role, permission, user.permissions);
}
