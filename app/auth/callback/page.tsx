'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';

/**
 * Callback route untuk OAuth.
 * InsForge SDK secara otomatis mendeteksi `insforge_code` di URL
 * dan menukarnya dengan session saat client diinisialisasi.
 * Halaman ini cukup menunggu proses exchange selesai,
 * lalu redirect ke /dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        // SDK otomatis exchange code dari URL saat createClient dipanggil.
        // Kita cukup cek apakah session sudah tersedia.
        const { data, error } = await insforge.auth.getCurrentUser();

        if (error || !data?.user) {
          // Jika gagal, redirect ke login dengan pesan error
          router.replace('/login?error=auth_failed');
          return;
        }

        // Session berhasil didapat, redirect ke dashboard
        router.replace('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        router.replace('/login?error=auth_failed');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">
          Memproses login...
        </p>
      </div>
    </div>
  );
}
