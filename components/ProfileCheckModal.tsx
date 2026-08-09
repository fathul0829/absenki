"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfilGuru } from '@/lib/guru';

const MAPEL_LIST = [
  "Matematika", "Fisika", "Kimia", "Biologi", "Bahasa Indonesia",
  "Bahasa Inggris", "Sejarah", "Geografi", "Ekonomi", "Sosiologi",
  "PKn", "Seni Budaya", "Penjaskes", "TIK/Informatika",
  "Bahasa Daerah", "Prakarya", "BK/Konseling"
];

export default function ProfileCheckModal() {
  const { user, profil, refreshProfil } = useAuth();
  const [namaLengkap, setNamaLengkap] = useState(profil?.displayName || '');
  const [posisi, setPosisi] = useState<'guru' | 'operator'>('guru');
  const [mataPelajaran, setMataPelajaran] = useState(MAPEL_LIST[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!namaLengkap.trim() || !mataPelajaran || !user) return;

    setSaving(true);
    try {
      // Simpan ke tabel guru di InsForge
      await updateProfilGuru(user.id, {
        display_name: namaLengkap.trim(),
        mata_pelajaran: posisi === 'guru' ? mataPelajaran : '',
        posisi: posisi,
      });

      // Simpan juga ke localStorage (backward compatibility)
      localStorage.setItem('profilGuru', JSON.stringify({
        namaLengkap: namaLengkap.trim(),
        mataPelajaran
      }));
      localStorage.setItem('mapelGuru', mataPelajaran);

      // Refresh AuthContext agar profilLengkap berubah menjadi true
      await refreshProfil();
    } catch (error) {
      console.error('Error menyimpan profil:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFormComplete = namaLengkap.trim() !== '' && (posisi === 'operator' || mataPelajaran !== '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Lengkapi Profil Anda</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Isi informasi berikut sebelum mulai menggunakan AbsenKi&apos;
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-slate-900 font-medium" 
                value={namaLengkap} 
                onChange={e => setNamaLengkap(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Posisi Sebagai</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none cursor-pointer text-slate-900 font-medium" 
                value={posisi} 
                onChange={e => setPosisi(e.target.value as 'guru' | 'operator')}
              >
                <option value="guru">Guru</option>
                <option value="operator">Operator Sekolah</option>
              </select>
            </div>
            {posisi === 'guru' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mata Pelajaran</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none cursor-pointer text-slate-900 font-medium" 
                  value={mataPelajaran} 
                  onChange={e => setMataPelajaran(e.target.value)}
                >
                  {MAPEL_LIST.map(mapel => (
                    <option key={mapel} value={mapel}>{mapel}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={handleSave} 
            disabled={!isFormComplete || saving}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              isFormComplete && !saving 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Menyimpan...
              </span>
            ) : (
              'Simpan & Mulai'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
