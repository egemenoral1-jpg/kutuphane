// Favori toggle API
// POST /api/books/toggle-favorite

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { userBookId } = await request.json()

    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId }
    })

    if (!userBook || userBook.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Kitap bulunamadı" },
        { status: 404 }
      )
    }

    const updated = await prisma.userBook.update({
      where: { id: userBookId },
      data: { isFavorite: !userBook.isFavorite }
    })

    return NextResponse.json({ isFavorite: updated.isFavorite })
  } catch (error) {
    console.error("Toggle favorite error:", error)
    return NextResponse.json(
      { error: "İşlem başarısız" },
      { status: 500 }
    )
  }
}