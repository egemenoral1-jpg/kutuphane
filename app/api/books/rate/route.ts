// Kitap puanlama API
// POST /api/books/rate

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

    const { userBookId, rating } = await request.json()

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating 1-5 arasında olmalıdır" },
        { status: 400 }
      )
    }

    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId }
    })

    if (!userBook || userBook.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Kitap bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.userBook.update({
      where: { id: userBookId },
      data: { rating }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Rate book error:", error)
    return NextResponse.json(
      { error: "Puanlama başarısız" },
      { status: 500 }
    )
  }
}