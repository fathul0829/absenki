'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { insforge } from '@/lib/insforge';
import { saveGuruProfile } from '@/lib/auth';

// ---- Interfaces ----

interface ProfilGuru {
  displayName: string;
  email: string;
  photoUrl: string;
  mataPelajaran: string;
  posisi: 'guru' | 'operator';
}

interface AuthContextType {
  user: any | null;
  profil: ProfilGuru | null;
  loading: boolean;
  profilLengkap: boolean;
  refreshProfil: () => Promise<void>;
}

// ---- Context ----

const AuthContext = createContext<AuthContextType>({
  user: null,
  profil: null,
  loading: true,
  profilLengkap: false,
  refreshProfil: async () => {},
});

// ---- Provider ----

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profil, setProfil] = useState<ProfilGuru | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilLengkap, setProfilLengkap] = useState(false);

  /**
   * Ambil data profil guru dari tabel `guru` berdasarkan auth user id.
   */
  const fetchProfil = useCallback(async (userId: string) => {
    const { data, error } = await insforge.database
      .from('guru')
      .select()
      .eq('auth_user_id', userId);

    if (error || !data || data.length === 0) {
      setProfil(null);
      setProfilLengkap(false);
      return;
    }

    const guru = data[0];
    const posisi = (guru.posisi || 'guru') as 'guru' | 'operator';
    const profilData: ProfilGuru = {
      displayName: guru.display_name || '',
      email: guru.email || '',
      photoUrl: guru.photo_url || '',
      mataPelajaran: guru.mata_pelajaran || '',
      posisi,
    };

    setProfil(profilData);

    const lengkap =
      posisi === 'operator' ||
      (typeof guru.mata_pelajaran === 'string' &&
      guru.mata_pelajaran.trim() !== '');
    setProfilLengkap(lengkap);

    // Sinkronisasi ke localStorage
    localStorage.setItem(
      'profilGuru',
      JSON.stringify({
        namaLengkap: profilData.displayName,
        mataPelajaran: profilData.mataPelajaran,
        posisi: profilData.posisi,
      })
    );
  }, []);

  /**
   * refreshProfil — dipanggil setelah user update profil
   * agar profilLengkap bisa berubah dan modal tertutup otomatis.
   */
  const refreshProfil = useCallback(async () => {
    if (!user) return;
    await fetchProfil(user.id);
  }, [user, fetchProfil]);

  /**
   * Inisialisasi: cek apakah user sudah login.
   * InsForge SDK menyimpan session di memory dan otomatis exchange
   * OAuth code dari URL jika ada.
   */
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();

        if (cancelled) return;

        if (error || !data?.user) {
          // Tidak ada user yang login
          setUser(null);
          setProfil(null);
          setProfilLengkap(false);
          localStorage.removeItem('profilGuru');
          localStorage.removeItem('mapelGuru');
          setLoading(false);
          return;
        }

        const currentUser = data.user;
        setUser(currentUser);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = currentUser.profile as Record<string, any> | null;

        // Simpan profil guru jika belum ada di database
        await saveGuruProfile(currentUser.id, {
          email: currentUser.email || '',
          displayName: String(profile?.nickname || profile?.name || currentUser.email || ''),
          photoUrl: String(profile?.avatar_url || ''),
        });

        // Ambil data profil dari tabel guru
        await fetchProfil(currentUser.id);
        
        // Cek jika profil belum lengkap di DB, coba migrasi dari localStorage
        const { data: dbGuru } = await insforge.database
          .from('guru')
          .select('mata_pelajaran, posisi')
          .eq('auth_user_id', currentUser.id)
          .single();
          
        if (dbGuru && dbGuru.posisi !== 'operator' && (!dbGuru.mata_pelajaran || dbGuru.mata_pelajaran === '')) {
          const localProfil = localStorage.getItem('profilGuru');
          if (localProfil) {
            const parsed = JSON.parse(localProfil);
            if (parsed.mataPelajaran) {
              const { updateProfilGuru } = await import('@/lib/guru');
              await updateProfilGuru(currentUser.id, {
                display_name: parsed.namaLengkap,
                mata_pelajaran: parsed.mataPelajaran,
              });
              // Ambil ulang data profil
              await fetchProfil(currentUser.id);
            }
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (!cancelled) {
          setUser(null);
          setProfil(null);
          setProfilLengkap(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [fetchProfil]);

  return (
    <AuthContext.Provider
      value={{ user, profil, loading, profilLengkap, refreshProfil }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---- Hook ----

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
