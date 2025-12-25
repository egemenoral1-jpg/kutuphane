// NextAuth.js (Auth.js v5) - API routes için full config
// Prisma ve bcrypt kullanabiliriz (Node.js runtime)

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        // credentials null check
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Kullanıcıyı veritabanında bul
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        // Kullanıcı yoksa null dön
        if (!user) {
          return null
        }

        // Şifre kontrolü
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Başarılı giriş - kullanıcı bilgilerini dön
        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  }
})
