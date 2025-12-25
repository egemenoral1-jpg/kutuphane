// API yardımcı fonksiyonlar
// Base URL ve fetch wrapper'lar

export const getBaseUrl = () => {
  // Server-side rendering için
  if (typeof window === 'undefined') {
    // Vercel deployment URL'i varsa kullan
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    // Lokal geliştirme
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  // Client-side için - mevcut origin'i kullan
  return window.location.origin
}

// API endpoint'i için tam URL oluştur
export const getApiUrl = (path: string) => {
  // Eğer path zaten / ile başlıyorsa, doğrudan kullan
  const endpoint = path.startsWith('/') ? path : `/${path}`
  
  // Development'ta veya same-origin isteklerde göreli path kullan
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return endpoint
  }
  
  return `${getBaseUrl()}${endpoint}`
}

// Gelişmiş fetch wrapper (hata yönetimi ile)
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(endpoint)
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bir hata oluştu' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
