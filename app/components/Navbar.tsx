'use client'

// Navbar komponenti - tüm sayfalarda gösterilecek navigasyon

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : ''
  }

  if (!session) return null

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
              📚 Kütüphane
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/dashboard')}`}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/books"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/books')}`}
              >
                Kitaplarım
              </Link>
              <Link
                href="/favorites"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/favorites')}`}
              >
                Favoriler
              </Link>
              <Link
                href="/authors"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/authors')}`}
              >
                Yazarlar
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-md transition"
            >
              <span className="text-sm">{session.user?.email || session.user?.name || 'Profil'}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
