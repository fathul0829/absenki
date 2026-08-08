'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileSpreadsheet, 
  ScanLine, 
  ClipboardList, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';

const menuItems = [
  { name: 'Beranda', path: '/dashboard', icon: Home },
  { name: 'Data Siswa', path: '/dashboard/data-siswa', icon: Users },
  { name: 'Import Excel', path: '/dashboard/import-excel', icon: FileSpreadsheet },
  { name: 'Scan Absen', path: '/dashboard/scan-absen', icon: ScanLine },
  { name: 'Rekap Kehadiran', path: '/dashboard/rekap-kehadiran', icon: ClipboardList },
  { name: 'Pengaturan', path: '/dashboard/pengaturan', icon: Settings },
];

export default function Sidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const { user, profil } = useAuth();

  // Data user untuk ditampilkan
  const displayName = profil?.displayName || user?.profile?.name || user?.email || 'Guru';
  const photoURL = profil?.photoUrl || user?.profile?.avatar_url || '';
  const avatarUrl = photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`;

  const handleLogout = async () => {
    try {
      await signOut();
      // signOut() sudah redirect ke /login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768 && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div 
      className={`bg-white h-screen border-r border-slate-200 flex flex-col sticky top-0 transition-all duration-300 ease-in-out shrink-0 ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo & Toggle */}
      <div className={`flex items-center h-20 px-4 relative ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <>
            <div className="flex item-center mr-8 ml-1 transition-none">
              <Image 
                src="/logo/logo side text 2(no bg).png"
                alt="AbsenKi Logo"
                width={173}
                height={40}
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            {/* Toggle Button (Open State) - hide on mobile since mobile handles sidebar via backdrop */}
            <button 
              onClick={() => setIsOpen(false)}
              className="hidden md:flex p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors absolute right-4 top-1/2 -translate-y-1/2 shrink-0"
              title="Tutup Sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <div className="group relative">
            <button 
              onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors hidden md:flex"
            >
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo/logo only 2(no bg).png"
                  alt="AbsenKi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </button>
            {/* Tooltip */}
            <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Buka Sidebar
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-2 ${isOpen ? 'px-4' : 'px-2'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
          
          return (
            <div key={item.path} className="group relative">
              <Link 
                href={item.path}
                onClick={handleMenuClick}
                className={`flex items-center rounded-lg transition-colors overflow-hidden ${
                  isOpen ? 'px-4 py-3 gap-3' : 'justify-center p-3 w-12 h-12 mx-auto'
                } ${
                  isActive 
                    ? (isOpen ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500 font-semibold' : 'bg-emerald-50 text-emerald-600 font-semibold')
                    : (isOpen ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
                }`}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                
                <span className={`transition-opacity duration-300 whitespace-nowrap ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden'
                }`}>
                  {item.name}
                </span>
              </Link>
              
              {/* Tooltip for closed state */}
              {!isOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`border-t border-slate-200 transition-all ${isOpen ? 'p-4' : 'py-4 flex flex-col items-center gap-4'}`}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors mb-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold text-slate-800 truncate">{displayName}</h4>
                <p className="text-xs text-slate-500">Guru</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <>
            <div className="group relative">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden cursor-pointer shadow-sm">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {displayName}
              </div>
            </div>
            <div className="group relative">
              <button 
                onClick={handleLogout}
                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Logout
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
