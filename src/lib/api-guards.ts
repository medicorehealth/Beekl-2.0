import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/session";
import { hasPermission, isAdminRole, type Permission } from "@/lib/rbac";

/**
 * API-route authorization guards. Unlike the page guards (which redirect),
 * these return a JSON 401/403 response so fetch callers can handle it. Every
 * privileged API route should start with one of these.
 */

type GuardOk = { ok: true; user: SessionUser };
type GuardFail = { ok: false; response: NextResponse };
export type GuardResult = GuardOk | GuardFail;

/** Require any authenticated user. */
export async function requireApiUser(): Promise<GuardResult> {
    const user = await getCurrentUser();
    if (!user) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { ok: true, user };
}

/** Require a specific permission. */
export async function requireApiPermission(
    permission: Permission
): Promise<GuardResult> {
    const result = await requireApiUser();
    if (!result.ok) return result;
    if (!hasPermission(result.user.role, permission, result.user.permissions)) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }
    return result;
}

/** Require admin-panel access (any admin role). */
export async function requireAdminApi(): Promise<GuardResult> {
    const result = await requireApiUser();
    if (!result.ok) return result;
    if (!isAdminRole(result.user.role)) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }
    return result;
}

/** Require the creator capability (or admin). */
export async function requireCreatorApi(): Promise<GuardResult> {
    const result = await requireApiUser();
    if (!result.ok) return result;
    const ok =
        hasPermission(result.user.role, "creator.dashboard", result.user.permissions) ||
        isAdminRole(result.user.role);
    if (!ok) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }
    return result;
}
