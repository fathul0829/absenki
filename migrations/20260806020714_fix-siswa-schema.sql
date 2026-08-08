-- Perbaikan skema tabel siswa agar sesuai dengan spesifikasi b2.md
-- Data siswa bersifat shared antar semua guru (bukan per-guru)

-- 1. Hapus policies lama (per-guru)
DROP POLICY IF EXISTS "siswa_select_own" ON public.siswa;
DROP POLICY IF EXISTS "siswa_insert_own" ON public.siswa;
DROP POLICY IF EXISTS "siswa_update_own" ON public.siswa;
DROP POLICY IF EXISTS "siswa_delete_own" ON public.siswa;

-- 2. Hapus kolom auth_user_id (data siswa tidak terikat ke guru tertentu)
ALTER TABLE public.siswa DROP COLUMN IF EXISTS auth_user_id;

-- 3. Hapus kolom jk (tidak dibutuhkan di skema baru)
ALTER TABLE public.siswa DROP COLUMN IF EXISTS jk;

-- 4. Rename kolom nama → nama_lengkap
ALTER TABLE public.siswa RENAME COLUMN nama TO nama_lengkap;

-- 5. Rename kolom qr_code_url → qr_image_url
ALTER TABLE public.siswa RENAME COLUMN qr_code_url TO qr_image_url;

-- 6. Set default value untuk qr_image_url
ALTER TABLE public.siswa ALTER COLUMN qr_image_url SET DEFAULT '';

-- 7. Tambahkan UNIQUE constraint pada NIS
ALTER TABLE public.siswa ADD CONSTRAINT siswa_nis_unique UNIQUE (nis);

-- 8. Set NISN ke NOT NULL
ALTER TABLE public.siswa ALTER COLUMN nisn SET NOT NULL;

-- 9. Buat RLS policies baru: semua guru yang login bisa read/write
CREATE POLICY "siswa_select_authenticated" ON public.siswa
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "siswa_insert_authenticated" ON public.siswa
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "siswa_update_authenticated" ON public.siswa
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "siswa_delete_authenticated" ON public.siswa
  FOR DELETE USING (auth.uid() IS NOT NULL);
