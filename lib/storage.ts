import { insforge } from './insforge';

const BUCKET = 'qr_codes';

/**
 * Upload file QR code PNG ke InsForge Storage.
 * Return URL publik file yang diupload.
 */
export async function uploadQRCode(
  studentId: string,
  qrBlob: Blob
): Promise<string> {
  const filePath = `${studentId}.png`;
  const file = new File([qrBlob], filePath, { type: 'image/png' });

  const { data, error } = await insforge.storage
    .from(BUCKET)
    .upload(filePath, file);

  if (error) {
    console.error('Error upload QR code:', error);
    throw error;
  }

  // Ambil URL publik
  const url = getQRCodeUrl(studentId);

  // Simpan key juga jika dibutuhkan
  if (data?.key) {
    console.log('QR uploaded with key:', data.key);
  }

  return url;
}

/**
 * Ambil URL publik QR code dari Storage.
 */
export function getQRCodeUrl(studentId: string): string {
  const filePath = `${studentId}.png`;
  const { data } = insforge.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return data?.publicUrl || '';
}

/**
 * Hapus file QR code dari Storage saat siswa dihapus.
 */
export async function deleteQRCode(studentId: string): Promise<void> {
  const filePath = `${studentId}.png`;
  const { error } = await insforge.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Error hapus QR code:', error);
    // Jangan throw — hapus QR gagal bukan critical error
  }
}
