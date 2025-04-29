import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "~/schemas/auth";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials)
          // Check if user is existed
          const user = await db.user.findUnique({
            where: {
              email: email,
            }
          })
          if (!user) return null

          // Check password matched
          const passwordMatched = await bcrypt.compare(password, user.password)
          if (!passwordMatched) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        } catch (error){
          console.error(error)
          return null
        }
      }
    }),
  ],
  pages: {
    signIn: "/app/sign-in",
  },
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({token, user}) => {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
} satisfies NextAuthConfig;
