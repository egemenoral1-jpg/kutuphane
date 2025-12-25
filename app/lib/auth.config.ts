// NextAuth.js base configuration - middleware ve API routes için ortak
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

// Temel auth config - edge runtime'da çalışabilir
export const authConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Middleware için authorization kontrolü
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith("/login")
      const isOnRegisterPage = nextUrl.pathname.startsWith("/register")
      
      // _next paths should always be allowed (static files, chunks, etc)
      if (nextUrl.pathname.startsWith("/_next")) {
        return true
      }
      
      const isOnPublicPage = isOnLoginPage || isOnRegisterPage || nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/api")

      // Giriş yapmamış ve public olmayan bir sayfaya gitmeye çalışıyorsa
      if (!isLoggedIn && !isOnPublicPage) {
        return false // Redirect to /login
      }

      // Giriş yapmış ve login/register sayfasına gitmeye çalışıyorsa
      if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
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
} satisfies NextAuthConfig

// Middleware için - sadece temel config
export const { auth: middleware } = NextAuth(authConfig)
