import { insforge } from './insforge';

export interface Guru {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string;
  photo_url: string;
  mata_pelajaran: string;
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
 * Update field `display_name` dan `mata_pelajaran` di tabel `guru`
 */
export async function updateProfilGuru(
  authUserId: string,
  data: { display_name?: string; mata_pelajaran?: string }
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
