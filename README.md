This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 📚 Kütüphane - Kitap Takip Uygulaması

Modern bir kitap takip ve okuma alışkanlığı geliştirme uygulaması.

### Özellikler
- 📖 Kitap ekleme ve yönetme
- ⏱️ Okuma süresi takibi
- 📝 Not alma sistemi
- ⭐ Kitap puanlama
- 🔥 Okuma streak'i (günlük okuma hedefi)
- 📊 Detaylı istatistikler
- 🌙 Dark mode desteği

## Getting Started

### Gereksinimler
- Node.js 18+ 
- PostgreSQL database (Neon DB kullanılıyor)

### Kurulum

1. Bağımlılıkları yükle:
```bash
npm install
```

2. Environment variables'ları ayarla (.env dosyası):
```env
DATABASE_URL="your-postgresql-connection-string"
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Veritabanını hazırla:
```bash
npx prisma generate
npx prisma db push
```

4. Development server'ı çalıştır:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints

Uygulama aşağıdaki API endpoint'lerini kullanır:

- `POST /api/register` - Yeni kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - Authentication (NextAuth.js)
- `GET/POST /api/books` - Kitap listesi ve ekleme
- `POST /api/books/delete` - Kitap silme
- `POST /api/books/rate` - Kitap puanlama
- `POST /api/books/toggle-favorite` - Favorilere ekleme/çıkarma
- `POST /api/books/update-page` - Sayfa güncelleme
- `GET/POST /api/notes` - Not sistemi
- `POST /api/reading-sessions/start` - Okuma oturumu başlat
- `POST /api/reading-sessions/stop` - Okuma oturumu durdur

## Deployment

### Vercel'e Deploy Etme

1. Vercel hesabı oluştur: [vercel.com](https://vercel.com)
2. GitHub repository'i bağla
3. Environment variables'ları Vercel dashboard'dan ekle:
   ```
   DATABASE_URL=your-production-db-url
   AUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
4. Deploy!

### Production Notları
- Veritabanı migrasyonları otomatik çalışmayabilir, manuel olarak `prisma db push` veya `prisma migrate deploy` çalıştırın
- AUTH_SECRET değerini güvenli oluşturun: `openssl rand -base64 32`
- NEXTAUTH_URL ve NEXT_PUBLIC_APP_URL'i production domain'iniz ile güncelleyin

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** NextAuth.js v5
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
