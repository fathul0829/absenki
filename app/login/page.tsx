'use client';

import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tampilkan error dari OAuth callback jika ada
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError === 'auth_failed') {
      setError('Login gagal. Pastikan popup tidak diblokir browser.');
    }
  }, [searchParams]);

  // Redirect jika sudah login
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // signInWithOAuth akan redirect browser ke Google,
      // jadi kode di bawah ini mungkin tidak akan dieksekusi.
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        // Pesan error yang lebih user-friendly
        if (err.message.includes('popup-closed-by-user')) {
          setError('Login dibatalkan. Silakan coba lagi.');
        } else if (err.message.includes('network-request-failed')) {
          setError('Koneksi internet bermasalah. Periksa koneksi Anda.');
        } else {
          setError('Gagal masuk. Silakan coba lagi.');
        }
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading saat mengecek auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Jika sudah login, jangan render apapun (sedang redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md ke atas)                                               */}
      {/* ========================================================================= */}
      <div className="hidden md:flex min-h-screen">
        {/* Kolom Kiri - Panel Hijau (50% lebar) */}
        <div className="w-1/2 bg-green-600 relative overflow-hidden flex flex-col justify-between p-12">
          {/* Elemen Dekoratif Geometric */}
          {/* Lingkaran besar di pojok kiri atas */}
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-green-500 opacity-50 pointer-events-none" />

          {/* Dua balok/pill vertikal di kiri atas */}
          <div className="absolute top-16 left-36 w-5 h-20 rounded-full bg-green-400 opacity-60 pointer-events-none" />
          <div className="absolute top-24 left-44 w-5 h-28 rounded-full bg-green-400 opacity-60 pointer-events-none" />

          {/* Lingkaran kecil dengan border */}
          <div className="absolute top-40 right-28 w-14 h-14 rounded-full border-2 border-green-300 opacity-60 pointer-events-none" />
          <div className="absolute top-20 right-44 w-6 h-6 rounded-full border-2 border-green-300 opacity-50 pointer-events-none" />

          {/* Titik-titik grid (dot pattern) */}
          <div 
            className="absolute top-24 right-12 w-32 h-32 opacity-30 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
              backgroundSize: '16px 16px'
            }} 
          />
          <div 
            className="absolute bottom-56 right-16 w-28 h-28 opacity-25 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
              backgroundSize: '14px 14px'
            }} 
          />

          {/* Lingkaran di pojok kiri bawah */}
          <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-green-400 opacity-40 pointer-events-none" />

          {/* Elemen setengah lingkaran di bawah */}
          <div className="absolute -bottom-8 right-36 w-36 h-36 rounded-full border-4 border-green-300 opacity-40 pointer-events-none" />

          {/* Tanda "×" di area bawah tengah */}
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 text-2xl font-light text-white opacity-50 select-none pointer-events-none">
            ✕
          </div>
          <div className="absolute top-52 left-20 text-lg font-light text-white opacity-40 select-none pointer-events-none">
            ✕
          </div>

          {/* Spacer top */}
          <div />

          {/* Konten Teks di Kiri Bawah */}
          <div className="relative z-10 mb-8 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Absensi<br />
              Mudah,<br />
              Kehadiran<br />
              Terpercaya
            </h1>
            <p className="text-green-100 text-sm mt-3 max-w-xs leading-relaxed">
              Kelola kehadiran dengan cepat, akurat, dan praktis.
            </p>
          </div>
        </div>

        {/* Kolom Kanan - Form Login (50% lebar) */}
        <div className="w-1/2 bg-white flex items-center justify-center relative px-12 min-h-screen">
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Logo AbsenKi' */}
            <div className="w-20 h-20 rounded-2xl shadow-md mb-6 relative overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-2">
              <Image
                src="/logo/logo only 2(no bg).png"
                alt="AbsenKi Logo"
                width={72}
                height={72}
                className="object-contain"
                priority
              />
            </div>

            {/* Judul */}
            <h2 className="text-2xl font-bold text-slate-800 text-center">
              Selamat Datang di AbsenKi&apos;
            </h2>

            {/* Deskripsi */}
            <p className="text-slate-500 text-sm text-center mt-2 mb-8 max-w-sm leading-relaxed">
              Masuk ke akun Anda untuk mengelola kehadiran, membuat QR code, dan melihat rekap absensi dengan mudah.
            </p>

            {/* Error Message */}
            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Tombol Masuk dengan Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 px-6 text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200 shadow-sm ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-green-600 rounded-full animate-spin"></span>
                  <span className="text-slate-600">Memuat...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Masuk dengan Google</span>
                </>
              )}
            </button>

            {/* Teks kecil di bawah tombol */}
            <p className="text-xs text-slate-400 text-center mt-4">
              Akses hanya untuk guru yang terdaftar
            </p>
          </div>

          {/* Footer kanan bawah */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-xs text-slate-400">
              &copy; 2026 AbsenKi&apos;. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (di bawah md)                                               */}
      {/* ========================================================================= */}
      <div className="flex md:hidden min-h-screen bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden flex-col justify-center items-center p-4">
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        {/* Main Card */}
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 z-10 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Selamat Datang di AbsenKi&apos;
            </h2>

            <div className="mb-6 relative w-48 h-28">
              <Image 
                src="/logo/logo udr text (w bg).png" 
                alt="AbsenKi Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>

            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Masuk ke akun Anda untuk mengelola kehadiran siswa, membuat QR code, dan melihat rekap absensi dengan mudah.
            </p>

            {/* Error Message */}
            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin"></span>
                  Sedang masuk...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Masuk dengan Google
                </>
              )}
            </button>

            <p className="mt-6 text-xs text-slate-400">
              Akses hanya untuk guru yang terdaftar
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-500 z-10">
          &copy; 2026 AbsenKi&apos;. Hak cipta dilindungi.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
