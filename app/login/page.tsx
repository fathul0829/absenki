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
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Jika sudah login, jangan render apapun (sedang redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center items-center p-4">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

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
            className={`w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></span>
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
        &copy; {new Date().getFullYear()} AbsenKi&apos;. Hak cipta dilindungi.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
