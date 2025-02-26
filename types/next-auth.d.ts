import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    role: Role
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
} 