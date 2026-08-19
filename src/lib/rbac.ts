import type { Role } from "@prisma/client";

/**
 * Role-Based Access Control (RBAC) for BeeKL.
 *
 * Permissions are coarse-grained capability keys. Roles map to a set of
 * permissions. Server endpoints must verify BOTH an authenticated session
 * AND that the user's role/permissions include the required capability.
 *
 * IMPORTANT: This is the single source of truth for authorization. Never rely
 * on the client to enforce these — always re-check server-side.
 */

export type Permission =
    // Admin area access
    | "admin.access"
    // Commerce
    | "products.view"
    | "products.manage"
    | "orders.view"
    | "orders.manage"
    | "customers.view"
    | "customers.manage"
    // Community
    | "creators.view"
    | "creators.manage"
    | "communities.view"
    | "communities.manage"
    | "submissions.view"
    | "submissions.moderate"
    | "contests.view"
    | "contests.manage"
    // Drops
    | "drops.view"
    | "drops.manage"
    // Fulfillment
    | "fulfillment.view"
    | "fulfillment.manage"
    | "returns.manage"
    // Finance
    | "commissions.view"
    | "commissions.manage"
    | "payouts.view"
    | "payouts.manage"
    // Content
    | "banners.manage"
    | "homepage.manage"
    // Analytics + settings
    | "analytics.view"
    | "settings.manage"
    // Creator dashboard (creator-owned data)
    | "creator.dashboard"
    // Customer dashboard
    | "customer.dashboard";

const ALL_ADMIN: Permission[] = [
    "admin.access",
    "products.view",
    "products.manage",
    "orders.view",
    "orders.manage",
    "customers.view",
    "customers.manage",
    "creators.view",
    "creators.manage",
    "communities.view",
    "communities.manage",
    "submissions.view",
    "submissions.moderate",
    "contests.view",
    "contests.manage",
    "drops.view",
    "drops.manage",
    "fulfillment.view",
    "fulfillment.manage",
    "returns.manage",
    "commissions.view",
    "commissions.manage",
    "payouts.view",
    "payouts.manage",
    "banners.manage",
    "homepage.manage",
    "analytics.view",
    "settings.manage",
];

/** Default permission map per role. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    SUPER_ADMIN: [...ALL_ADMIN],
    ADMIN: ALL_ADMIN.filter((p) => p !== "settings.manage"),
    CONTENT_MANAGER: [
        "admin.access",
        "products.view",
        "products.manage",
        "banners.manage",
        "homepage.manage",
        "drops.view",
        "drops.manage",
        "contests.view",
        "contests.manage",
        "analytics.view",
    ],
    MODERATOR: [
        "admin.access",
        "submissions.view",
        "submissions.moderate",
        "communities.view",
        "creators.view",
        "contests.view",
        "contests.manage",
    ],
    FINANCE: [
        "admin.access",
        "commissions.view",
        "commissions.manage",
        "payouts.view",
        "payouts.manage",
        "orders.view",
        "analytics.view",
    ],
    SUPPORT: [
        "admin.access",
        "orders.view",
        "customers.view",
        "fulfillment.view",
        "returns.manage",
    ],
    CREATOR: ["creator.dashboard", "customer.dashboard"],
    CUSTOMER: ["customer.dashboard"],
};

/** All roles that can enter the admin panel. */
export const ADMIN_ROLES: Role[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "CONTENT_MANAGER",
    "MODERATOR",
    "FINANCE",
    "SUPPORT",
];

/** Check whether a role has a given permission (via defaults). */
export function roleHasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Check whether a role + explicit grants include a permission. */
export function hasPermission(
    role: Role,
    permission: Permission,
    extraGrants: string[] = []
): boolean {
    if (roleHasPermission(role, permission)) return true;
    return extraGrants.includes(permission);
}

/** Does this role have any admin-panel access at all? */
export function isAdminRole(role: Role): boolean {
    return ADMIN_ROLES.includes(role);
}

/** Human label for a role. */
export function roleLabel(role: Role): string {
    const map: Record<Role, string> = {
        CUSTOMER: "Customer",
        CREATOR: "Creator",
        ADMIN: "Admin",
        SUPER_ADMIN: "Super Admin",
        CONTENT_MANAGER: "Content Manager",
        MODERATOR: "Moderator",
        FINANCE: "Finance",
        SUPPORT: "Support",
    };
    return map[role] ?? role;
}
