import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role;
            permissions: string[];
            creatorId?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: Role;
        permissions?: string[];
        creatorId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;
        permissions: string[];
        creatorId?: string | null;
    }
}
