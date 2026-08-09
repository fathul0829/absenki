import { insforge } from './insforge';

export interface Guru {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string;
  photo_url: string;
  mata_pelajaran: string;
  posisi: 'guru' | 'operator';
  created_at: string;
}

/**
 * Ambil data profil guru dari tabel `guru`
 */
export async function getProfilGuru(authUserId: string): Promise<Guru | null> {
  const { data, error } = await insforge.database
    .from('guru')
    .select()
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !data) {
    console.error('Error fetching profil guru:', error);
    return null;
  }

  return data as Guru;
}

/**
 * Update field `display_name`, `mata_pelajaran`, dan `posisi` di tabel `guru`
 */
export async function updateProfilGuru(
  authUserId: string,
  data: {
    display_name?: string;
    mata_pelajaran?: string;
    posisi?: 'guru' | 'operator';
  }
): Promise<Guru | null> {
  const { data: updatedData, error } = await insforge.database
    .from('guru')
    .update(data)
    .eq('auth_user_id', authUserId)
    .select()
    .single();

  if (error || !updatedData) {
    console.error('Error updating profil guru:', error);
    throw error;
  }

  // Sinkronisasi ke localStorage
  const currentLocal = JSON.parse(localStorage.getItem('profilGuru') || '{}');
  localStorage.setItem(
    'profilGuru',
    JSON.stringify({
      ...currentLocal,
      namaLengkap: updatedData.display_name,
      mataPelajaran: updatedData.mata_pelajaran,
      posisi: updatedData.posisi,
    })
  );

  return updatedData as Guru;
}

/**
 * Ambil daftar kelas unik dari tabel `siswa`
 */
export async function getDaftarKelas(): Promise<string[]> {
  const { data, error } = await insforge.database
    .from('siswa')
    .select('kelas');

  if (error || !data) {
    console.error('Error fetching daftar kelas:', error);
    return [];
  }

  // Filter out duplicates and sort
  const kelasSet = new Set(data.map((item: any) => item.kelas));
  return Array.from(kelasSet).sort();
}

/**
 * Ambil semua guru dari tabel guru.
 * Dipakai oleh operator untuk filter di rekap kehadiran.
 */
export async function getDaftarGuru(): Promise<
  { id: string; display_name: string; mata_pelajaran: string; posisi: string }[]
> {
  const { data, error } = await insforge.database
    .from('guru')
    .select('id, display_name, mata_pelajaran, posisi');

  if (error || !data) {
    console.error('Error fetching daftar guru:', error);
    return [];
  }

  return data as { id: string; display_name: string; mata_pelajaran: string; posisi: string }[];
}

/**
 * Ambil daftar mata pelajaran unik dari tabel sesi_absen.
 * Dipakai oleh operator untuk filter di rekap kehadiran.
 */
export async function getDaftarMapel(): Promise<string[]> {
  const { data, error } = await insforge.database
    .from('guru')
    .select('mata_pelajaran')
    .eq('posisi', 'guru');

  if (error || !data) {
    console.error('Error fetching daftar mapel:', error);
    return [];
  }

  const mapelSet = new Set(data.map((item: any) => item.mata_pelajaran).filter((m: string) => m && m.trim() !== ''));
  return Array.from(mapelSet).sort();
}
