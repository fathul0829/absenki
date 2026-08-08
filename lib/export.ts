import Papa from 'papaparse';
import { Kehadiran } from './kehadiran';

/**
 * Ekspor data kehadiran ke file CSV dan trigger download di browser.
 */
export function exportKehadiranCSV(data: Kehadiran[], filename?: string) {
  // Format data untuk CSV
  const rows = data.map((item, idx) => ({
    'No': idx + 1,
    'Nama Lengkap': item.nama_lengkap,
    'NIS': item.nis,
    'Kelas': item.kelas,
    'Mata Pelajaran': item.mata_pelajaran,
    'Tanggal': formatTanggal(item.scanned_at),
    'Waktu Scan': formatWaktu(item.scanned_at),
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'Rekap_Kehadiran_AbsenKi.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format tanggal ke DD/MM/YYYY.
 */
function formatTanggal(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format waktu ke HH:MM.
 */
function formatWaktu(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
