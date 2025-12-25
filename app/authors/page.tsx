import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import Navbar from '../components/Navbar'

// Yazarlar sayfası
// Kullanıcının okuduğu/okuyor olduğu yazarları listeler

export default async function AuthorsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Kullanıcının kitaplarından yazarları getir
  const userBooks = await prisma.userBook.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      book: {
        include: {
          author: true
        }
      }
    }
  })

  // Yazarları grupla ve istatistikleri hesapla
  const authorsMap = new Map<string, {
    id: string
    name: string
    bio: string | null
    totalBooks: number
    completedBooks: number
    readingBooks: number
    books: Array<{
      id: string
      title: string
      coverUrl: string | null
      status: string
    }>
  }>()

  userBooks.forEach((userBook) => {
    const author = userBook.book.author
    const existing = authorsMap.get(author.id)

    if (existing) {
      existing.totalBooks++
      if (userBook.status === 'completed') existing.completedBooks++
      if (userBook.status === 'reading') existing.readingBooks++
      existing.books.push({
        id: userBook.bookId,
        title: userBook.book.title,
        coverUrl: userBook.book.coverUrl,
        status: userBook.status
      })
    } else {
      authorsMap.set(author.id, {
        id: author.id,
        name: author.name,
        bio: author.bio,
        totalBooks: 1,
        completedBooks: userBook.status === 'completed' ? 1 : 0,
        readingBooks: userBook.status === 'reading' ? 1 : 0,
        books: [{
          id: userBook.bookId,
          title: userBook.book.title,
          coverUrl: userBook.book.coverUrl,
          status: userBook.status
        }]
      })
    }
  })

  const authors = Array.from(authorsMap.values()).sort((a, b) => 
    b.totalBooks - a.totalBooks
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ✍️ Yazarlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Okuduğun yazarlar ve kitapları
            </p>
          </div>

          {authors.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
                Henüz hiç kitap eklemediniz
              </p>
              <Link
                href="/books/new"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                İlk Kitabını Ekle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition p-6"
                >
                  {/* Yazar başlığı */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {author.name}
                    </h2>
                    {author.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {author.bio}
                      </p>
                    )}
                  </div>

                  {/* İstatistikler */}
                  <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {author.totalBooks}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Kitap</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {author.completedBooks}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Okudum</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {author.readingBooks}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Okuyorum</p>
                    </div>
                  </div>

                  {/* Kitaplar */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Kitapları
                    </h3>
                    {author.books.map((book) => (
                      <Link
                        key={book.id}
                        href={`/books/${book.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        {book.coverUrl && (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {book.title}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            book.status === 'completed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                              : book.status === 'reading'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {book.status === 'completed' ? 'Tamamlandı' : 
                             book.status === 'reading' ? 'Okuyorum' : 'Başlanmadı'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
