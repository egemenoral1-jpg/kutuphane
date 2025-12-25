// Sayfa numarası güncelleme API
// POST /api/books/update-page

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

    const { userBookId, currentPage } = await request.json()

    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId },
      include: { book: true }
    })

    if (!userBook || userBook.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Kitap bulunamadı" },
        { status: 404 }
      )
    }

    // Status güncelle
    let status = userBook.status
    if (currentPage > 0 && status === 'not_started') {
      status = 'reading'
    }
    if (currentPage >= userBook.book.totalPages) {
      status = 'completed'
    }

    await prisma.userBook.update({
      where: { id: userBookId },
      data: {
        currentPage,
        status,
        ...(status === 'reading' && !userBook.startedAt ? { startedAt: new Date() } : {}),
        ...(status === 'completed' && !userBook.completedAt ? { completedAt: new Date() } : {})
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update page error:", error)
    return NextResponse.json(
      { error: "Sayfa güncellenemedi" },
      { status: 500 }
    )
  }
}