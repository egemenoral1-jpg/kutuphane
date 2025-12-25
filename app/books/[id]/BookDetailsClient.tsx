'use client'

// Kitap detay client komponenti
// Timer, sayfa güncelleme, not ekleme, rating

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserBook = {
  id: string
  bookId: string
  currentPage: number
  status: string
  isFavorite: boolean
  rating: number | null
  book: {
    title: string
    totalPages: number
    coverUrl: string | null
    description: string | null
    author: {
      name: string
    }
  }
  notes: Array<{
    id: string
    pageNumber: number
    content: string
    createdAt: Date
  }>
  readingSessions: Array<{
    id: string
    startTime: Date
    endTime: Date | null
    duration: number | null
    pagesRead: number
  }>
}

export default function BookDetailsClient({
  userBook: initialUserBook,
  totalReadingTime
}: {
  userBook: UserBook
  totalReadingTime: number
}) {
  const router = useRouter()
  const [userBook, setUserBook] = useState(initialUserBook)
  const [currentPage, setCurrentPage] = useState(initialUserBook.currentPage)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [notePageNumber, setNotePageNumber] = useState(currentPage)
  const [loading, setLoading] = useState(false)

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = async () => {
    try {
      const res = await fetch('/api/reading-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBookId: userBook.id })
      })
      const data = await res.json()
      if (res.ok) {
        setSessionId(data.sessionId)
        setIsTimerRunning(true)
        setTimerSeconds(0)
      }
    } catch (error) {
      alert('Timer başlatılamadı')
    }
  }

  const stopTimer = async () => {
    if (!sessionId) return
    
    try {
      const res = await fetch('/api/reading-sessions/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          pagesRead: currentPage - initialUserBook.currentPage
        })
      })
      if (res.ok) {
        setIsTimerRunning(false)
        setSessionId(null)
        router.refresh()
      }
    } catch (error) {
      alert('Timer durdurulamadı')
    }
  }

  const updatePage = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/books/update-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userBookId: userBook.id,
          currentPage
        })
      })
      if (res.ok) {
        alert('Sayfa güncellendi!')
        router.refresh()
      }
    } catch (error) {
      alert('Sayfa güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      const res = await fetch('/api/books/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBookId: userBook.id })
      })
      if (res.ok) {
        const data = await res.json()
        setUserBook(prev => ({ ...prev, isFavorite: data.isFavorite }))
      }
    } catch (error) {
      alert('İşlem başarısız')
    }
  }

  const addNote = async () => {
    if (!noteContent.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userBookId: userBook.id,
          pageNumber: notePageNumber,
          content: noteContent
        })
      })
      if (res.ok) {
        setNoteContent('')
        setShowNoteForm(false)
        router.refresh()
      }
    } catch (error) {
      alert('Not eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const rateBook = async (rating: number) => {
    try {
      const res = await fetch('/api/books/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userBookId: userBook.id,
          rating
        })
      })
      if (res.ok) {
        setUserBook(prev => ({ ...prev, rating }))
      }
    } catch (error) {
      alert('Puanlama başarısız')
    }
  }

  const progress = (currentPage / userBook.book.totalPages) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/books" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
          ← Kitaplarıma Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Kitap Bilgileri */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {userBook.book.coverUrl && (
                <img
                  src={userBook.book.coverUrl}
                  alt={userBook.book.title}
                  className="w-full rounded-lg mb-4"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userBook.book.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {userBook.book.author.name}
              </p>
              
              <button
                onClick={toggleFavorite}
                className="w-full mb-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {userBook.isFavorite ? '⭐ Favorilerden Çıkar' : '☆ Favorilere Ekle'}
              </button>

              {userBook.book.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Açıklama</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userBook.book.description}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Sayfa:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {userBook.book.totalPages}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Okuma:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.floor(totalReadingTime / 60)}s {totalReadingTime % 60}dk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ: İnteraktif Özellikler */}
          <div className="lg:col-span-2 space-y-6">
            {/* İlerleme */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">İlerleme</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Sayfa {currentPage}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <input
                  type="number"
                  min="0"
                  max={userBook.book.totalPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Sayfa numarası"
                />
                <button
                  onClick={updatePage}
                  disabled={loading || currentPage === initialUserBook.currentPage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Güncelle
                </button>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Okuma Timer&apos;ı</h2>
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white mb-6">
                  {formatTime(timerSeconds)}
                </div>
                <button
                  onClick={isTimerRunning ? stopTimer : startTimer}
                  className={`px-8 py-3 rounded-lg font-medium transition ${
                    isTimerRunning
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isTimerRunning ? '⏸ Durdur' : '▶ Başlat'}
                </button>
              </div>
            </div>

            {/* Puanlama */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Puanla</h2>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => rateBook(star)}
                    className="text-4xl hover:scale-110 transition"
                  >
                    {star <= (userBook.rating || 0) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              {userBook.rating && (
                <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  {userBook.rating}/5 yıldız
                </p>
              )}
            </div>

            {/* Notlar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notlarım</h2>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Not Ekle
                </button>
              </div>

              {showNoteForm && (
                <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <input
                    type="number"
                    min="0"
                    max={userBook.book.totalPages}
                    value={notePageNumber}
                    onChange={(e) => setNotePageNumber(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                    placeholder="Sayfa numarası"
                  />
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Notunuzu yazın..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addNote}
                      disabled={loading || !noteContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteForm(false)
                        setNoteContent('')
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {userBook.notes.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Henüz not eklemediniz
                </p>
              ) : (
                <div className="space-y-3">
                  {userBook.notes.map((note) => (
                    <div key={note.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Sayfa {note.pageNumber}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
