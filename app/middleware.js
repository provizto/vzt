// Daftar kode negara terlarang (US = Amerika Serikat)
const BLOCKED_COUNTRIES = ['US', 'IR', 'KP'];

export function middleware(req) {
  // Mengambil data geolokasi langsung dari header bawaan Vercel
  const country = req.headers.get('x-vercel-ip-country') || 'US';

  if (BLOCKED_COUNTRIES.includes(country)) {
    return new Response(
      JSON.stringify({
        error: "403 Forbidden",
        message: "Access denied. Provizto protocol is unavailable in your jurisdiction due to regulatory restrictions."
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Menjalankan pengecekan geoblocking di semua halaman
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};