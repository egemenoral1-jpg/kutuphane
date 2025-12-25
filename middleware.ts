// Middleware - protected routes için authentication kontrolü
// Giriş yapmamış kullanıcıları login sayfasına yönlendirir

export { middleware } from "@/app/lib/auth.config"

// Middleware hangi route'larda çalışacak
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next static files, chunks, images, etc
     * - static files (favicon, images, etc)
     */
    '/((?!_next|api|favicon.ico).*)',
  ],
}
