// Kitap silme API route
// DELETE /api/books/delete - kullanıcının kitabını siler

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { userBookId } = await request.json()

    if (!userBookId) {
      return NextResponse.json(
        { error: "Kitap ID'si gereklidir" },
        { status: 400 }
      )
    }

    // Kullanıcının kitabını kontrol et
    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId }
    })

    if (!userBook) {
      return NextResponse.json(
        { error: "Kitap bulunamadı" },
        { status: 404 }
      )
    }

    if (userBook.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu kitabı silme yetkiniz yok" },
        { status: 403 }
      )
    }

    // İlişkili verileri sil (notlar, okuma seansları)
    await prisma.$transaction([
      // Notları sil
      prisma.note.deleteMany({
        where: { userBookId }
      }),
      // Okuma seanslarını sil
      prisma.readingSession.deleteMany({
        where: { userBookId }
      }),
      // Kullanıcı kitabını sil
      prisma.userBook.delete({
        where: { id: userBookId }
      })
    ])

    return NextResponse.json({
      message: "Kitap başarıyla silindi"
    })

  } catch (error) {
    console.error("Book deletion error:", error)
    return NextResponse.json(
      { error: "Kitap silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
