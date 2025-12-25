// Reading session başlatma API
// POST /api/reading-sessions/start

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

    const readingSession = await prisma.readingSession.create({
      data: {
        userId: session.user.id,
        userBookId,
        startTime: new Date()
      }
    })

    return NextResponse.json({ sessionId: readingSession.id })
  } catch (error) {
    console.error("Start session error:", error)
    return NextResponse.json(
      { error: "Session başlatılamadı" },
      { status: 500 }
    )
  }
}