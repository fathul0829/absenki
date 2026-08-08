import { insforge } from './insforge';

// ============================================
// Interface TypeScript
// ============================================
export interface Siswa {
  id: string;
  nama_lengkap: string;
  nis: string;
  nisn: string;
  kelas: string;
  qr_image_url: string;
  created_at: string;
}

// ============================================
// Fungsi Database Siswa
// ============================================

/**
 * Ambil semua data siswa, diurutkan berdasarkan created_at descending.
 */
export async function getSiswa(): Promise<Siswa[]> {
  const { data, error } = await insforge.database
    .from('siswa')
    .select()
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error mengambil data siswa:', error);
    return [];
  }

  return (data as Siswa[]) || [];
}

/**
 * Filter siswa berdasarkan kelas.
 */
export async function getSiswaByKelas(kelas: string): Promise<Siswa[]> {
  const { data, error } = await insforge.database
    .from('siswa')
    .select()
    .eq('kelas', kelas)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error mengambil siswa by kelas:', error);
    return [];
  }

  return (data as Siswa[]) || [];
}

/**
 * Ambil satu siswa berdasarkan id.
 */
export async function getSiswaById(id: string): Promise<Siswa | null> {
  const { data, error } = await insforge.database
    .from('siswa')
    .select()
    .eq('id', id);

  if (error) {
    console.error('Error mengambil siswa by id:', error);
    return null;
  }

  return (data && data.length > 0 ? data[0] : null) as Siswa | null;
}

/**
 * Ambil satu siswa berdasarkan NIS (dipakai saat scan QR).
 */
export async function getSiswaByNis(nis: string): Promise<Siswa | null> {
  const { data, error } = await insforge.database
    .from('siswa')
    .select()
    .eq('nis', nis);

  if (error) {
    console.error('Error mengambil siswa by NIS:', error);
    return null;
  }

  return (data && data.length > 0 ? data[0] : null) as Siswa | null;
}

/**
 * Tambah satu siswa baru ke tabel.
 */
export async function addSiswa(data: {
  nama_lengkap: string;
  nis: string;
  nisn: string;
  kelas: string;
}): Promise<Siswa | null> {
  const { data: result, error } = await insforge.database
    .from('siswa')
    .insert([data])
    .select();

  if (error) {
    console.error('Error menambah siswa:', error);
    throw error;
  }

  return (result && result.length > 0 ? result[0] : null) as Siswa | null;
}

/**
 * Tambah banyak siswa sekaligus (dari import Excel).
 * Menggunakan single insert dengan array.
 */
export async function addSiswaBatch(
  dataArray: { nama_lengkap: string; nis: string; nisn: string; kelas: string }[]
): Promise<Siswa[]> {
  const { data: result, error } = await insforge.database
    .from('siswa')
    .insert(dataArray)
    .select();

  if (error) {
    console.error('Error menambah siswa batch:', error);
    throw error;
  }

  return (result as Siswa[]) || [];
}

/**
 * Update data siswa berdasarkan id.
 */
export async function updateSiswa(
  id: string,
  data: Partial<Omit<Siswa, 'id' | 'created_at'>>
): Promise<Siswa | null> {
  const { data: result, error } = await insforge.database
    .from('siswa')
    .update(data)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error update siswa:', error);
    throw error;
  }

  return (result && result.length > 0 ? result[0] : null) as Siswa | null;
}

/**
 * Update field qr_image_url pada siswa.
 * Dipanggil setelah QR code berhasil diupload ke Storage.
 */
export async function updateQrImageUrl(
  id: string,
  qrImageUrl: string
): Promise<void> {
  const { error } = await insforge.database
    .from('siswa')
    .update({ qr_image_url: qrImageUrl })
    .eq('id', id);

  if (error) {
    console.error('Error update QR image URL:', error);
    throw error;
  }
}

/**
 * Hapus siswa berdasarkan id.
 */
export async function deleteSiswa(id: string): Promise<void> {
  const { error } = await insforge.database
    .from('siswa')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error hapus siswa:', error);
    throw error;
  }
}
