"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { 
  User, 
  Moon, 
  Camera, 
  QrCode, 
  FileDown, 
  Info,
  LogOut,
  Monitor,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProfilGuru } from '@/lib/guru';

const MAPEL_LIST = [
  "Matematika", "Fisika", "Kimia", "Biologi", "Bahasa Indonesia",
  "Bahasa Inggris", "Sejarah", "Geografi", "Ekonomi", "Sosiologi",
  "PKn", "Seni Budaya", "Penjaskes", "TIK/Informatika",
  "Bahasa Daerah", "Prakarya", "BK/Konseling"
];

export default function PengaturanPage() {
  const { user, profil, refreshProfil } = useAuth();
  
  const [namaGuru, setNamaGuru] = useState('Guru');
  const [mataPelajaran, setMataPelajaran] = useState('Matematika');
  const [isEditingMapel, setIsEditingMapel] = useState(false);
  const [tempNama, setTempNama] = useState('');
  const [tempMapel, setTempMapel] = useState('');
  const [theme, setTheme] = useState('light');
  
  const [loadingSave, setLoadingSave] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }

    if (profil) {
      setNamaGuru(profil.displayName || '');
      setMataPelajaran(profil.mataPelajaran || '');
      setTempNama(profil.displayName || '');
      setTempMapel(profil.mataPelajaran || '');
    }
  }, [profil]);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSaveMapel = async () => {
    if (!tempMapel.trim() || !tempNama.trim() || !user) return;
    
    setLoadingSave(true);
    try {
      await updateProfilGuru(user.id, {
        display_name: tempNama.trim(),
        mata_pelajaran: tempMapel
      });
      
      await refreshProfil();
      
      setMataPelajaran(tempMapel);
      setNamaGuru(tempNama.trim());
      setIsEditingMapel(false);
      
      setNotification('Profil berhasil disimpan');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
      <Header 
        title="Pengaturan" 
        subtitle="Kelola preferensi akun dan aplikasi Anda"
      />
      
      {notification && (
        <div className="mb-6 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 1. Profil Guru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <User size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Profil Guru</h3>
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
              <img src={profil?.photoUrl || `https://ui-avatars.com/api/?name=${namaGuru.replace(/\s+/g, '+')}&background=10b981&color=fff`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              {!isEditingMapel ? (
                <h4 className="font-bold text-slate-900 text-lg">{namaGuru}</h4>
              ) : (
                <input 
                  type="text" 
                  value={tempNama} 
                  onChange={e => setTempNama(e.target.value)}
                  className="text-sm font-bold border border-slate-300 rounded-md px-2 py-1.5 w-full text-slate-900 bg-white focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-1"
                />
              )}
              <p className="text-slate-500 text-sm mb-2">{profil?.email || user?.email || 'Loading...'}</p>
              
              <div className="mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Mata Pelajaran:</span>
                {isEditingMapel ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                      value={tempMapel} 
                      onChange={e => setTempMapel(e.target.value)} 
                      className="text-sm border border-slate-300 rounded-md px-2 py-1.5 w-full text-slate-900 bg-white focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
                    >
                      {MAPEL_LIST.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleSaveMapel} 
                      disabled={loadingSave}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shrink-0 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {loadingSave ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Simpan
                    </button>
                    <button 
                      onClick={() => setIsEditingMapel(false)} 
                      disabled={loadingSave}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors shrink-0 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">{mataPelajaran || '-'}</span>
                    <button onClick={() => { setIsEditingMapel(true); setTempNama(namaGuru); setTempMapel(mataPelajaran || MAPEL_LIST[0]); }} className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md">Edit</button>
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mt-1">
                <svg viewBox="0 0 24 24" className="w-3 h-3">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Akun Google
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">
            * Informasi profil diatur melalui Akun Google. Anda bisa menyesuaikan Nama Lengkap dan Mata Pelajaran untuk keperluan absensi di sini.
          </p>
        </div>

        {/* 2. Preferensi Tampilan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <Moon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Preferensi Tampilan</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button 
                onClick={() => changeTheme('light')} 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-colors ${theme === 'light' ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="w-full h-12 bg-white border border-slate-200 rounded shadow-sm flex flex-col gap-1 p-1">
                  <div className="w-full h-2 bg-slate-100 rounded"></div>
                  <div className="w-2/3 h-2 bg-slate-100 rounded"></div>
                </div>
                <span className={`text-xs font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-slate-600'}`}>Terang</span>
              </button>
              <button 
                onClick={() => changeTheme('dark')}
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-colors ${theme === 'dark' ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="w-full h-12 bg-slate-800 border border-slate-700 rounded shadow-sm flex flex-col gap-1 p-1">
                  <div className="w-full h-2 bg-slate-700 rounded"></div>
                  <div className="w-2/3 h-2 bg-slate-700 rounded"></div>
                </div>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-emerald-700' : 'text-slate-600'}`}>Gelap</span>
              </button>
              <button 
                onClick={() => changeTheme('system')}
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-colors ${theme === 'system' ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="w-full h-12 bg-slate-200 border border-slate-300 rounded shadow-sm flex items-center justify-center">
                  <Monitor size={16} className="text-slate-400" />
                </div>
                <span className={`text-xs font-bold ${theme === 'system' ? 'text-emerald-700' : 'text-slate-600'}`}>Sistem</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Pengaturan Kamera */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Camera size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pengaturan Kamera</h3>
          </div>
          
          <label className="block text-sm font-semibold text-slate-700 mb-2">Kamera Default untuk Scan</label>
          <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-3 px-3 font-medium mb-2 outline-none">
            <option>Otomatis (Sistem)</option>
          </select>
          <p className="text-xs text-slate-500">Pilih kamera yang akan digunakan otomatis saat membuka halaman Scan Absen.</p>
        </div>

        {/* 4. Pengaturan QR Code */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pengaturan QR Code</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Format Download</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" defaultChecked />
                <span className="text-sm font-medium text-slate-700">PNG (Transparan)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">JPG (White BG)</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran Default (px)</label>
            <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 font-medium outline-none">
              <option>512 x 512</option>
              <option>1024 x 1024</option>
              <option>2048 x 2048</option>
            </select>
          </div>
        </div>

        {/* 5. Pengaturan Ekspor */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <FileDown size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pengaturan Ekspor</h3>
          </div>
          
          <label className="block text-sm font-semibold text-slate-700 mb-2">Format Separator CSV</label>
          <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-3 px-3 font-medium mb-2 outline-none">
            <option>Koma (,)</option>
            <option>Titik Koma (;)</option>
            <option>Tab (\t)</option>
          </select>
          <p className="text-xs text-slate-500">Sesuaikan dengan format regional Microsoft Excel Anda untuk menghindari error kolom berantakan.</p>
        </div>

        {/* 6. Tentang Aplikasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Info size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Tentang Aplikasi</h3>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <QrCode size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">AbsenKi'</h4>
                <p className="text-sm font-medium text-slate-500">Versi 2.0.0 (InsForge Powered)</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem absensi digital berbasis QR Code khusus untuk pendidik. Dikembangkan untuk mempercepat pencatatan dan rekapitulasi kehadiran.
            </p>
          </div>
          
          <button className="w-full mt-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
            Pusat Bantuan & Panduan
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-red-600 mb-1">Keluar dari Akun</h3>
          <p className="text-sm text-slate-500">Anda perlu masuk dengan akun Google lagi untuk mengakses dashboard.</p>
        </div>
        <button 
          onClick={async () => {
            const { insforge } = await import('@/lib/insforge');
            await insforge.auth.signOut();
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-all"
        >
          <LogOut size={18} />
          Keluar Sekarang
        </button>
      </div>
    </>
  );
}
