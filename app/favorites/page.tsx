import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import Navbar from '../components/Navbar'

// Favoriler sayfası
// Kullanıcının favori kitaplarını gösterir

export default async function FavoritesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Favori kitapları getir
  const favoriteBooks = await prisma.userBook.findMany({
    where: {
      userId: session.user.id,
      isFavorite: true
    },
    include: {
      book: {
        include: {
          author: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ⭐ Favori Kitaplarım
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              En sevdiğin kitaplar burada
            </p>
          </div>

          {favoriteBooks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
                Henüz favori kitabın yok
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                Kitap detay sayfasından ⭐ butonuna tıklayarak favorilere ekleyebilirsin
              </p>
              <Link
                href="/books"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Kitaplarıma Dön
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteBooks.map((userBook) => (
                <Link
                  key={userBook.id}
                  href={`/books/${userBook.bookId}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition p-6"
                >
                  {/* Kapak resmi */}
                  {userBook.book.coverUrl && (
                    <div className="mb-4">
                      <img
                        src={userBook.book.coverUrl}
                        alt={userBook.book.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Kitap bilgileri */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                        {userBook.book.title}
                      </h3>
                      <span className="text-yellow-500 text-xl flex-shrink-0">⭐</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400">
                      {userBook.book.author.name}
                    </p>

                    {/* Durum badge */}
                    <div className="flex items-center gap-3 pt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userBook.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : userBook.status === 'reading'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {userBook.status === 'completed' ? 'Tamamlandı' : 
                         userBook.status === 'reading' ? 'Okuyorum' : 'Başlanmadı'}
                      </span>

                      {userBook.rating && (
                        <span className="text-yellow-500 font-semibold">
                          {userBook.rating}/5
                        </span>
                      )}
                    </div>

                    {/* İlerleme */}
                    {userBook.currentPage > 0 && (
                      <div className="pt-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>İlerleme</span>
                          <span>{Math.round((userBook.currentPage / userBook.book.totalPages) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(userBook.currentPage / userBook.book.totalPages) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {userBook.currentPage} / {userBook.book.totalPages} sayfa
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
