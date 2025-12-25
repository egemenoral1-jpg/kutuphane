import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import Navbar from '../components/Navbar'

// Kitaplarım sayfası
// Kullanıcının tüm kitaplarını listeler

export default async function BooksPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Kullanıcının tüm kitaplarını getir
  const userBooks = await prisma.userBook.findMany({
    where: { userId: session.user.id },
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kitaplarım
            </h1>
            <Link
              href="/books/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + Yeni Kitap Ekle
            </Link>
          </div>

          {userBooks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Henüz kitap eklemediniz
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk kitabınızı ekleyerek okuma yolculuğunuza başlayın!
              </p>
              <Link
                href="/books/new"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                İlk Kitabını Ekle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBooks.map((userBook) => (
                <Link
                  key={userBook.id}
                  href={`/books/${userBook.bookId}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  {userBook.book.coverUrl && (
                    <img
                      src={userBook.book.coverUrl}
                      alt={userBook.book.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                        {userBook.book.title}
                      </h3>
                      {userBook.isFavorite && (
                        <span className="text-xl flex-shrink-0">⭐</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {userBook.book.author.name}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
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
                            ⭐ {userBook.rating}/5
                          </span>
                        )}
                      </div>

                      {/* İlerleme çubuğu */}
                      {userBook.currentPage > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Sayfa {userBook.currentPage}</span>
                            <span>{userBook.book.totalPages} sayfa</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min((userBook.currentPage / userBook.book.totalPages) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
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
