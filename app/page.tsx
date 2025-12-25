// Ana sayfa - Hoş geldiniz sayfası
// Giriş yapmamış kullanıcılar için landing page

import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Kütüphane
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Okuma alışkanlıklarınızı takip edin, notlar alın ve kitap tutkunuzla övünün!
        </p>
        
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
            <span className="text-2xl">🔥</span>
            <span>Günlük okuma streak&apos;lerinizi takip edin</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
            <span className="text-2xl">⏱️</span>
            <span>Okuma sürenizi ölçün</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
            <span className="text-2xl">📝</span>
            <span>Sayfa bazlı notlar alın</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
            <span className="text-2xl">⭐</span>
            <span>Kitapları puanlayın ve favorilerinizi işaretleyin</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg border border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-medium text-base h-12 px-8 shadow-lg"
          >
            Kayıt Ol
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-base h-12 px-8"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  )
}
