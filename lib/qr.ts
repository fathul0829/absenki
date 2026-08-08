import QRCode from 'qrcode';
import { Siswa } from './siswa';

/**
 * Generate QR code sebagai Blob PNG.
 * Data yang di-encode:
 * {
 *   studentId, namaLengkap, nis, nisn, kelas
 * }
 */
export async function generateQRCode(siswa: Siswa): Promise<Blob> {
  const qrData = JSON.stringify({
    studentId: siswa.id,
    namaLengkap: siswa.nama_lengkap,
    nis: siswa.nis,
    nisn: siswa.nisn,
    kelas: siswa.kelas,
  });

  // Generate QR sebagai Data URL lalu konversi ke Blob
  const dataUrl = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // Konversi Data URL ke Blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return blob;
}
