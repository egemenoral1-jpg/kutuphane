// Kitap ekleme API route
// POST /api/books - yeni kitap ve yazar ekler, kullanıcı ile ilişkilendirir

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

// Kitap ekleme validasyonu
const bookSchema = z.object({
  title: z.string().min(1, "Kitap başlığı gereklidir"),
  authorName: z.string().min(1, "Yazar adı gereklidir"),
  totalPages: z.number().min(1, "Sayfa sayısı en az 1 olmalıdır"),
  coverUrl: z.string().url("Geçerli bir URL giriniz").nullable().optional(),
  description: z.string().nullable().optional(),
  isbn: z.string().nullable().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validasyon
    const validation = bookSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, authorName, totalPages, coverUrl, description, isbn } = validation.data

    // Yazar var mı kontrol et, yoksa oluştur
    let author = await prisma.author.findFirst({
      where: { name: authorName }
    })

    if (!author) {
      author = await prisma.author.create({
        data: { name: authorName }
      })
    }

    // Kitap var mı kontrol et (ISBN veya başlık+yazar ile)
    let book = null
    
    if (isbn) {
      book = await prisma.book.findUnique({
        where: { isbn }
      })
    }
    
    if (!book) {
      book = await prisma.book.findFirst({
        where: {
          title,
          authorId: author.id
        }
      })
    }

    // Kitap yoksa oluştur
    if (!book) {
      book = await prisma.book.create({
        data: {
          title,
          authorId: author.id,
          totalPages,
          coverUrl: coverUrl || null,
          description: description || null,
          isbn: isbn || null
        }
      })
    }

    // Kullanıcının bu kitabı zaten ekleyip eklemediğini kontrol et
    const existingUserBook = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id
        }
      }
    })

    if (existingUserBook) {
      return NextResponse.json(
        { error: "Bu kitabı zaten eklediniz" },
        { status: 400 }
      )
    }

    // Kullanıcı-Kitap ilişkisi oluştur
    const userBook = await prisma.userBook.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
        status: 'not_started'
      }
    })

    return NextResponse.json({
      message: "Kitap başarıyla eklendi",
      book: {
        id: userBook.id
      },
      userBook
    })

  } catch (error) {
    console.error("Book creation error:", error)
    return NextResponse.json(
      { error: "Kitap eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
