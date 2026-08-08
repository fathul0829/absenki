import { insforge } from './insforge';

// ============================================
// Interface TypeScript
// ============================================
export interface Kehadiran {
  id: string;
  session_id: string;
  student_id: string;
  nama_lengkap: string;
  nis: string;
  kelas: string;
  mata_pelajaran: string;
  scanned_at: string;
}

// ============================================
// Fungsi Kehadiran
// ============================================

/**
 * Cek apakah siswa sudah tercatat hadir di sesi yang sama.
 * Return true jika sudah ada, false jika belum.
 */
export async function cekDuplikat(
  sessionId: string,
  studentId: string
): Promise<boolean> {
  const { data, error } = await insforge.database
    .from('kehadiran')
    .select('id')
    .eq('session_id', sessionId)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error cek duplikat kehadiran:', error);
    return false;
  }

  return (data && data.length > 0);
}

/**
 * Tambah record kehadiran baru.
 */
export async function addKehadiran(data: {
  session_id: string;
  student_id: string;
  nama_lengkap: string;
  nis: string;
  kelas: string;
  mata_pelajaran: string;
}): Promise<Kehadiran | null> {
  const { data: result, error } = await insforge.database
    .from('kehadiran')
    .insert([data])
    .select();

  if (error) {
    console.error('Error menambah kehadiran:', error);
    throw error;
  }

  return (result && result.length > 0 ? result[0] : null) as Kehadiran | null;
}

/**
 * Ambil semua kehadiran berdasarkan session_id.
 * Sort berdasarkan scanned_at ascending.
 */
export async function getKehadiranBySesi(
  sessionId: string
): Promise<Kehadiran[]> {
  const { data, error } = await insforge.database
    .from('kehadiran')
    .select()
    .eq('session_id', sessionId)
    .order('scanned_at', { ascending: true });

  if (error) {
    console.error('Error mengambil kehadiran:', error);
    return [];
  }

  return (data as Kehadiran[]) || [];
}

// ============================================
// Interface Filter Rekap
// ============================================
export interface FilterRekap {
  mataPelajaran: string;
  tanggalDari: string;   // format: YYYY-MM-DD
  tanggalSampai: string; // format: YYYY-MM-DD
  kelas?: string;        // opsional
}

// ============================================
// Fungsi Rekap Kehadiran
// ============================================

/**
 * Query tabel kehadiran dengan filter rentang tanggal, mata pelajaran, dan kelas.
 */
export async function getRekapKehadiran(
  filter: FilterRekap
): Promise<Kehadiran[]> {
  let query = insforge.database
    .from('kehadiran')
    .select()
    .eq('mata_pelajaran', filter.mataPelajaran)
    .gte('scanned_at', filter.tanggalDari + 'T00:00:00')
    .lte('scanned_at', filter.tanggalSampai + 'T23:59:59');

  if (filter.kelas && filter.kelas !== 'Semua Kelas' && filter.kelas !== '') {
    query = query.eq('kelas', filter.kelas);
  }

  const { data, error } = await query.order('scanned_at', { ascending: true });

  if (error) {
    console.error('Error mengambil rekap kehadiran:', error);
    return [];
  }

  return (data as Kehadiran[]) || [];
}

/**
 * Ambil rekap kehadiran per siswa (total hadir per siswa).
 * Group by student_id dan hitung total kehadiran.
 */
export interface RekapPerSiswa {
  studentId: string;
  namaLengkap: string;
  nis: string;
  kelas: string;
  totalHadir: number;
}

export async function getRekapPerSiswa(
  filter: FilterRekap
): Promise<RekapPerSiswa[]> {
  const allKehadiran = await getRekapKehadiran(filter);

  // Group by student_id
  const grouped = new Map<string, RekapPerSiswa>();

  for (const k of allKehadiran) {
    const existing = grouped.get(k.student_id);
    if (existing) {
      existing.totalHadir += 1;
    } else {
      grouped.set(k.student_id, {
        studentId: k.student_id,
        namaLengkap: k.nama_lengkap,
        nis: k.nis,
        kelas: k.kelas,
        totalHadir: 1,
      });
    }
  }

  return Array.from(grouped.values());
}
