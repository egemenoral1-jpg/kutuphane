'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UserBook = {
  id: string
  bookId: string
  status: string
  currentPage: number
  isFavorite: boolean
  rating: number | null
  book: {
    title: string
    totalPages: number
    author: {
      name: string
    }
  }
}

export default function RecentBooksList({ books }: { books: UserBook[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (e: React.MouseEvent, userBookId: string, bookTitle: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`"${bookTitle}" kitabını silmek istediğinize emin misiniz?`)) {
      return
    }

    setDeletingId(userBookId)

    try {
      const res = await fetch('/api/books/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBookId })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Kitap silinirken bir hata oluştu')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setDeletingId(null)
    }
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Henüz kitap eklemediniz
        </p>
        <Link
          href="/books"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          İlk Kitabını Ekle
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {books.map((userBook) => (
        <div
          key={userBook.id}
          className="relative group"
        >
          <Link
            href={`/books/${userBook.bookId}`}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-12">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {userBook.book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userBook.book.author.name}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
                  <span className={`px-2 py-1 rounded ${
                    userBook.status === 'completed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : userBook.status === 'reading'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {userBook.status === 'completed' ? 'Tamamlandı' : 
                     userBook.status === 'reading' ? 'Okuyorum' : 'Başlanmadı'}
                  </span>
                  {userBook.currentPage > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      Sayfa {userBook.currentPage} / {userBook.book.totalPages}
                    </span>
                  )}
                  {userBook.isFavorite && <span>⭐</span>}
                </div>
              </div>
              {userBook.rating && (
                <div className="text-yellow-500 font-semibold">
                  ⭐ {userBook.rating}/5
                </div>
              )}
            </div>
          </Link>
          
          {/* Silme butonu */}
          <button
            onClick={(e) => handleDelete(e, userBook.id, userBook.book.title)}
            disabled={deletingId === userBook.id}
            className="absolute bottom-4 right-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Kitabı sil"
          >
            {deletingId === userBook.id ? (
              <span className="text-lg">⏳</span>
            ) : (
              <span className="text-lg">🗑️</span>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
