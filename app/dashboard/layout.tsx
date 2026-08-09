'use client';

import Sidebar from '@/components/Sidebar';
import ProfileCheckModal from '@/components/ProfileCheckModal';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, profilLengkap } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <img src="/logo/logo only 2(no bg).png" alt="Logo" className="w-8 h-8 object-contain" />
           <span className="font-bold text-lg text-emerald-600">AbsenKi</span>
        </div>
        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay (Backdrop) */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Area */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:overflow-y-auto md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onMobileClose={() => setIsMobileSidebarOpen(false)} />
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen w-full">
        {!profilLengkap && <ProfileCheckModal />}
        {children}
      </div>
    </div>
  );
}
