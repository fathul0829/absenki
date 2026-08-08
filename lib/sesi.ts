import { insforge } from './insforge';

// ============================================
// Interface TypeScript
// ============================================
export interface SesiAbsen {
  id: string;
  guru_uid: string;
  mata_pelajaran: string;
  kelas: string;
  tanggal: string;
  created_at: string;
}

// ============================================
// Fungsi Sesi Absen
// ============================================

/**
 * Buat sesi absen baru.
 */
export async function createSesi(data: {
  guru_uid: string;
  mata_pelajaran: string;
  kelas: string;
  tanggal: string;
}): Promise<SesiAbsen | null> {
  const { data: result, error } = await insforge.database
    .from('sesi_absen')
    .insert([data])
    .select();

  if (error) {
    console.error('Error membuat sesi absen:', error);
    throw error;
  }

  return (result && result.length > 0 ? result[0] : null) as SesiAbsen | null;
}

/**
 * Cek apakah sudah ada sesi aktif untuk guru tersebut
 * di tanggal dan mata pelajaran yang sama.
 */
export async function getSesiAktif(
  guruUid: string,
  tanggal: string,
  mataPelajaran: string
): Promise<SesiAbsen | null> {
  const { data, error } = await insforge.database
    .from('sesi_absen')
    .select()
    .eq('guru_uid', guruUid)
    .eq('tanggal', tanggal)
    .eq('mata_pelajaran', mataPelajaran);

  if (error) {
    console.error('Error mengambil sesi aktif:', error);
    return null;
  }

  return (data && data.length > 0 ? data[0] : null) as SesiAbsen | null;
}

/**
 * Ambil atau buat sesi absen.
 * Jika sesi sudah ada → return sesi yang ada.
 * Jika belum ada → buat sesi baru.
 * Dipanggil otomatis saat pertama kali QR di-scan.
 */
export async function getOrCreateSesi(
  guruUid: string,
  mataPelajaran: string,
  kelas: string,
  tanggal: string
): Promise<SesiAbsen> {
  // Cek apakah sesi sudah ada
  const existing = await getSesiAktif(guruUid, tanggal, mataPelajaran);
  if (existing) return existing;

  // Buat sesi baru
  const newSesi = await createSesi({
    guru_uid: guruUid,
    mata_pelajaran: mataPelajaran,
    kelas,
    tanggal,
  });

  if (!newSesi) {
    throw new Error('Gagal membuat sesi absen baru');
  }

  return newSesi;
}
