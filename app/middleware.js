import { NextResponse } from 'next/server';

// Daftar kode negara (ISO 3166-1 alpha-2) yang ingin diblokir
// US = United States, IR = Iran, KP = North Korea
const BLOCKED_COUNTRIES = ['US', 'IR', 'KP'];

export function middleware(req) {
  // Vercel otomatis menyuntikkan data geolokasi pada header setiap request
  const country = req.geo?.country || 'US'; 

  // Jika negara asal pengguna ada di dalam daftar blokir
  if (BLOCKED_COUNTRIES.includes(country)) {
    // Tampilkan halaman teks statis 403 Forbidden langsung di server Edge
    return new NextResponse(
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

  // Jika aman, izinkan pengguna masuk ke aplikasi
  return NextResponse.next();
}

// Konfigurasi agar middleware ini berjalan di semua halaman DApp
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};