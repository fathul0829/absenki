import { insforge } from './insforge';

/**
 * Login menggunakan Google OAuth.
 * Redirect user ke halaman Google, lalu kembali ke /auth/callback.
 */
export async function signInWithGoogle() {
  const { error } = await insforge.auth.signInWithOAuth('google', {
    redirectTo: `${window.location.origin}/auth/callback`,
  });

  if (error) {
    throw new Error(error.message || 'Gagal memulai login Google');
  }
}

/**
 * Logout user dan redirect ke halaman login.
 */
export async function signOut() {
  await insforge.auth.signOut();
  window.location.href = '/';
}

/**
 * Ambil session user yang sedang login.
 * Return user object atau null.
 */
export async function getSession() {
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Simpan profil guru ke tabel `guru` setelah login pertama kali.
 * Jika profil sudah ada, tidak akan insert ulang.
 */
export async function saveGuruProfile(
  userId: string,
  data: { email: string; displayName: string; photoUrl: string }
) {
  // Cek apakah profil sudah ada
  const { data: existing, error: selectError } = await insforge.database
    .from('guru')
    .select()
    .eq('auth_user_id', userId);

  if (selectError) {
    console.error('Error cek profil guru:', selectError);
    return;
  }

  // Jika belum ada, insert record baru
  if (!existing || existing.length === 0) {
    const { error: insertError } = await insforge.database
      .from('guru')
      .insert({
        auth_user_id: userId,
        email: data.email,
        display_name: data.displayName,
        photo_url: data.photoUrl,
        mata_pelajaran: '',
      });

    if (insertError) {
      console.error('Error menyimpan profil guru:', insertError);
    }
  }
}

/**
 * Cek apakah profil guru sudah lengkap (mata_pelajaran terisi).
 */
export async function checkProfilLengkap(userId: string): Promise<boolean> {
  const { data, error } = await insforge.database
    .from('guru')
    .select('mata_pelajaran, posisi')
    .eq('auth_user_id', userId);

  if (error || !data || data.length === 0) return false;

  const guru = data[0];
  if (guru.posisi === 'operator') return true;
  
  return typeof guru.mata_pelajaran === 'string' && guru.mata_pelajaran.trim() !== '';
}

/**
 * Update profil guru (display_name dan mata_pelajaran).
 */
export async function updateProfilGuru(
  userId: string,
  data: { display_name: string; mata_pelajaran: string }
) {
  const { error } = await insforge.database
    .from('guru')
    .update(data)
    .eq('auth_user_id', userId);

  if (error) {
    console.error('Error update profil guru:', error);
    throw error;
  }
}
