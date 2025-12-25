import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import Navbar from '../components/Navbar'

// Profil sayfası
// Kullanıcının istatistiklerini ve bilgilerini gösterir

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Kullanıcı bilgilerini ve istatistiklerini al
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userBooks: {
        include: {
          book: true
        }
      },
      readingSessions: true,
      notes: true,
      streaks: {
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  // İstatistikleri hesapla
  const stats = {
    totalBooks: user.userBooks.length,
    completedBooks: user.userBooks.filter(ub => ub.status === 'completed').length,
    readingBooks: user.userBooks.filter(ub => ub.status === 'reading').length,
    notStartedBooks: user.userBooks.filter(ub => ub.status === 'not_started').length,
    totalPages: user.userBooks.reduce((sum, ub) => sum + ub.currentPage, 0),
    totalReadingMinutes: user.readingSessions.reduce((sum, rs) => sum + (rs.duration || 0), 0),
    totalNotes: user.notes.length,
    averageRating: user.userBooks.filter(ub => ub.rating).length > 0
      ? (user.userBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0) / 
         user.userBooks.filter(ub => ub.rating).length).toFixed(1)
      : '0',
    favoriteBooks: user.userBooks.filter(ub => ub.isFavorite).length,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalStreakDays: user.streaks.length
  }

  // Okuma süresini formatla
  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} dakika`
    if (mins === 0) return `${hours} saat`
    return `${hours} saat ${mins} dakika`
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profil Başlığı */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.name || 'Okuyucu'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          {/* Streak İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🔥</span>
                <div>
                  <p className="text-sm opacity-90">Mevcut Streak</p>
                  <p className="text-3xl font-bold">{stats.currentStreak} gün</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏆</span>
                <div>
                  <p className="text-sm opacity-90">En Uzun Streak</p>
                  <p className="text-3xl font-bold">{stats.longestStreak} gün</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">📅</span>
                <div>
                  <p className="text-sm opacity-90">Toplam Okuma Günü</p>
                  <p className="text-3xl font-bold">{stats.totalStreakDays}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kitap İstatistikleri */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📚 Kitap İstatistikleri
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBooks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Toplam Kitap</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.completedBooks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tamamlandı</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.readingBooks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Okuyorum</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.notStartedBooks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Başlanmadı</p>
              </div>
            </div>
          </div>

          {/* Okuma İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                ⏱️ Okuma Süreleri
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Toplam Okuma Süresi</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatReadingTime(stats.totalReadingMinutes)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Okunan Sayfa</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.totalPages}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Toplam Not</span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.totalNotes}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                ⭐ Değerlendirmeler
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Ortalama Puan</span>
                  <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    ⭐ {stats.averageRating} / 5
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Favori Kitap</span>
                  <span className="text-xl font-bold text-pink-600 dark:text-pink-400">
                    {stats.favoriteBooks}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Okuma Oranı</span>
                  <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    {stats.totalBooks > 0 
                      ? `%${Math.round((stats.completedBooks / stats.totalBooks) * 100)}`
                      : '%0'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
