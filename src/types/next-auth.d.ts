import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        role?: string
    }

    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
    }
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        id?: string
    }
}
