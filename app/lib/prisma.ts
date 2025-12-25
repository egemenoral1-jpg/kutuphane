// Prisma Client instance - veritabanı bağlantısı
// Geliştirme modunda hot reload ile her seferinde yeni client oluşturmasın diye global'de tutuyoruz

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
