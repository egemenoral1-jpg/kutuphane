// Reading session durdurma API
// POST /api/reading-sessions/stop

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

    const { sessionId, pagesRead } = await request.json()

    const readingSession = await prisma.readingSession.findUnique({
      where: { id: sessionId }
    })

    if (!readingSession || readingSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session bulunamadı" },
        { status: 404 }
      )
    }

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - readingSession.startTime.getTime()) / 1000 / 60) // dakika

    await prisma.readingSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration,
        pagesRead
      }
    })

    // Streak güncelle (bugün okuma yaptıysa)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.streak.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      },
      create: {
        userId: session.user.id,
        date: today
      },
      update: {}
    })

    // User streak sayacını güncelle
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const yesterdayStreak = await prisma.streak.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: yesterday
          }
        }
      })

      let newStreak = 1
      if (yesterdayStreak) {
        newStreak = user.currentStreak + 1
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          lastReadDate: new Date()
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Stop session error:", error)
    return NextResponse.json(
      { error: "Session durdurulamadı" },
      { status: 500 }
    )
  }
}