import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ROLE_PERMISSIONS } from "@/lib/rbac";
import { z } from "zod";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

/**
 * Unified authentication for BeeKL.
 *
 * There is NO separate admin login. Everyone signs in through the same
 * credentials flow. The user's `role` (stored in the DB and encoded into the
 * JWT) determines what they can access. Roles/permissions are always
 * re-verified server-side; the client can never elevate its own role.
 */
export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(raw) {
                const parsed = credentialsSchema.safeParse(raw);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;
                const user = await prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                    include: {
                        creator: { select: { id: true } },
                        permissions: { include: { permission: true } },
                    },
                });

                if (!user || !user.passwordHash || !user.isActive) return null;

                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) return null;

                const grants = user.permissions.map((p) => p.permission.key);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    creatorId: user.creator?.id ?? null,
                    permissions: grants,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // Initial sign-in: copy identity from the authorize() result.
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.creatorId = user.creatorId ?? null;
                // Merge role defaults + explicit grants.
                const roleDefaults = ROLE_PERMISSIONS[user.role] ?? [];
                token.permissions = Array.from(
                    new Set([...(roleDefaults as string[]), ...(user.permissions ?? [])])
                );
            }

            // On session refresh, re-read the authoritative role from the DB so a
            // revoked/downgraded user loses access without needing to re-login.
            if (trigger === "update" || (!user && token.id)) {
                const fresh = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    include: {
                        creator: { select: { id: true } },
                        permissions: { include: { permission: true } },
                    },
                });
                if (fresh) {
                    token.role = fresh.role;
                    token.creatorId = fresh.creator?.id ?? null;
                    const roleDefaults = ROLE_PERMISSIONS[fresh.role] ?? [];
                    const grants = fresh.permissions.map((p) => p.permission.key);
                    token.permissions = Array.from(
                        new Set([...(roleDefaults as string[]), ...grants])
                    );
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.permissions = token.permissions ?? [];
                session.user.creatorId = token.creatorId ?? null;
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
