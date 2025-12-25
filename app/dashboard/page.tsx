import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import RecentBooksList from '../components/RecentBooksList'

// Dashboard - Ana sayfa
// Kullanıcının streak, kitapları ve okuma istatistiklerini gösterir

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Kullanıcı bilgilerini al
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userBooks: {
        include: {
          book: {
            include: {
              author: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 5
      },
      streaks: {
        orderBy: {
          date: 'desc'
        },
        take: 7
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  // İstatistikler
  const totalBooks = await prisma.userBook.count({
    where: { userId: user.id }
  })

  const completedBooks = await prisma.userBook.count({
    where: { 
      userId: user.id,
      status: 'completed'
    }
  })

  const readingBooks = await prisma.userBook.count({
    where: { 
      userId: user.id,
      status: 'reading'
    }
  })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Karşılama ve Streak */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Hoş geldin, {user.name || 'Okuyucu'}! 👋
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="bg-orange-100 dark:bg-orange-900 px-6 py-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mevcut Streak</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {user.currentStreak} gün
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 px-6 py-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">En Uzun Streak</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {user.longestStreak} gün
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Kitap</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalBooks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Okuduğum</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completedBooks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Okuyorum</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{readingBooks}</p>
            </div>
          </div>

          {/* Son Kitaplar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Son Kitaplarım</h2>
              <Link 
                href="/books"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Tümünü Gör →
              </Link>
            </div>
            
            <RecentBooksList books={user.userBooks} />
          </div>
        </div>
      </div>
    </>
  )
}
