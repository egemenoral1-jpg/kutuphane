import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { notFound } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import BookDetailsClient from './BookDetailsClient'

// Kitap detay sayfası
// Timer, sayfa takibi, notlar ve rating

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id: bookId } = await params

  // Kullanıcının bu kitabını getir
  const userBook = await prisma.userBook.findUnique({
    where: {
      userId_bookId: {
        userId: session.user.id,
        bookId: bookId
      }
    },
    include: {
      book: {
        include: {
          author: true
        }
      },
      notes: {
        orderBy: {
          pageNumber: 'asc'
        }
      },
      readingSessions: {
        orderBy: {
          startTime: 'desc'
        },
        take: 10
      }
    }
  })

  if (!userBook) {
    notFound()
  }

  // Toplam okuma süresi (dakika)
  const totalReadingTime = await prisma.readingSession.aggregate({
    where: {
      userBookId: userBook.id,
      duration: { not: null }
    },
    _sum: {
      duration: true
    }
  })

  return (
    <>
      <Navbar />
      <BookDetailsClient 
        userBook={userBook} 
        totalReadingTime={totalReadingTime._sum.duration || 0}
      />
    </>
  )
}
