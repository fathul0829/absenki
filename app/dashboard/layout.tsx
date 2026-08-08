'use client';

import Sidebar from '@/components/Sidebar';
import ProfileCheckModal from '@/components/ProfileCheckModal';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, profilLengkap } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Loading state — tampilkan spinner di tengah layar
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika tidak ada user (sedang redirect ke login)
  if (!user) {
    return null;
  }

  // User ada — render dashboard, modal akan muncul jika profil belum lengkap
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto min-h-screen">
        {!profilLengkap && <ProfileCheckModal />}
        {children}
      </div>
    </div>
  );
}
