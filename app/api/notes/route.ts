// Not ekleme API
// POST /api/notes

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

const noteSchema = z.object({
  userBookId: z.string(),
  pageNumber: z.number().min(0),
  content: z.string().min(1, "Not içeriği gereklidir")
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
    const validation = noteSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { userBookId, pageNumber, content } = validation.data

    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId }
    })

    if (!userBook || userBook.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Kitap bulunamadı" },
        { status: 404 }
      )
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        userBookId,
        pageNumber,
        content
      }
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Create note error:", error)
    return NextResponse.json(
      { error: "Not eklenemedi" },
      { status: 500 }
    )
  }
}