'use client'

// Yeni kitap ekleme sayfası
// Google Books ISBN API ile arama veya manuel ekleme

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar'

type BookSearchResult = {
  title: string
  authors: string[]
  pageCount: number
  imageLinks?: {
    thumbnail: string
  }
  description?: string
  industryIdentifiers?: Array<{
    type: string
    identifier: string
  }>
}

export default function NewBookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([])
  const [showManualForm, setShowManualForm] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    totalPages: '',
    coverUrl: '',
    description: '',
    isbn: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const searchBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setError('')
    setSearchResults([])

    try {
      // Google Books API'ye istek at (kitap adı veya ISBN ile arama)
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery.trim())}&maxResults=10`
      )
      const data = await response.json()

      console.log('Google Books API Response:', data)

      if (data.items && data.items.length > 0) {
        setSearchResults(data.items.map((item: { volumeInfo: typeof searchResults[0] }) => item.volumeInfo))
      } else {
        setError(`"${searchQuery}" için kitap bulunamadı. Manuel olarak ekleyebilirsiniz.`)
        setShowManualForm(true)
      }
    } catch (err) {
      console.error('Google Books API Error:', err)
      setError('Arama sırasında bir hata oluştu. Manuel olarak ekleyebilirsiniz.')
      setShowManualForm(true)
    } finally {
      setSearching(false)
    }
  }

  const selectBook = (book: BookSearchResult) => {
    const isbn = book.industryIdentifiers?.find(id => 
      id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier || ''

    setFormData({
      title: book.title || '',
      authorName: book.authors?.[0] || '',
      totalPages: book.pageCount?.toString() || '',
      coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      description: book.description || '',
      isbn: isbn
    })
    setShowManualForm(true)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          authorName: formData.authorName,
          totalPages: parseInt(formData.totalPages),
          coverUrl: formData.coverUrl || null,
          description: formData.description || null,
          isbn: formData.isbn || null
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kitap eklenirken bir hata oluştu')
        return
      }

      // Başarı mesajı göster
      alert('✅ Kitap başarıyla eklendi!')
      router.push('/dashboard')
    } catch (error) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Yeni Kitap Ekle
            </h1>

            {/* ISBN Arama */}
            {!showManualForm && (
              <div className="mb-8">
                <form onSubmit={searchBook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kitap Ara
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Kitap adı veya ISBN girin (örn: 1984, 9780141439518)"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={searching}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                      >
                        {searching ? '🔍 Aranıyor...' : '🔍 Ara'}
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Sonuçlar:</h3>
                      {searchResults.map((book, index) => (
                        <div
                          key={index}
                          onClick={() => selectBook(book)}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex gap-4"
                        >
                          {book.imageLinks?.thumbnail && (
                            <img
                              src={book.imageLinks.thumbnail.replace('http:', 'https:')}
                              alt={book.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {book.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {book.authors?.join(', ')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {book.pageCount} sayfa
                            </p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Seç →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowManualForm(true)}
                    className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                  >
                    Manuel Olarak Ekle
                  </button>
                </form>
              </div>
            )}

            {/* Manuel Form */}
            {showManualForm && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Kitap Bilgileri
                  </h2>
                  <button
                    onClick={() => {
                      setShowManualForm(false)
                      setFormData({
                        title: '',
                        authorName: '',
                        totalPages: '',
                        coverUrl: '',
                        description: '',
                        isbn: ''
                      })
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ← Kitap Ara
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kitap Adı *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Örn: 1984"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yazar Adı *
                    </label>
                    <input
                      type="text"
                      name="authorName"
                      value={formData.authorName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Örn: George Orwell"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Toplam Sayfa Sayısı *
                    </label>
                    <input
                      type="number"
                      name="totalPages"
                      value={formData.totalPages}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Örn: 328"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kapak Resmi URL
                    </label>
                    <input
                      type="url"
                      name="coverUrl"
                      value={formData.coverUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ISBN
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Örn: 9780141439518"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Kitap hakkında kısa bir açıklama..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Link 
                      href="/books"
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center font-medium"
                    >
                      İptal
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Ekleniyor...' : 'Kitap Ekle'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
