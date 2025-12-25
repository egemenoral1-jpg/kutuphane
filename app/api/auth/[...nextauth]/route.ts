// NextAuth.js API route handler
// /api/auth/* - tüm auth istekleri buradan geçer (signIn, signOut, callback vb.)

import { handlers } from "@/app/lib/auth"

export const { GET, POST } = handlers
