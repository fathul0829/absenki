-- Tabel sesi_absen
CREATE TABLE IF NOT EXISTS public.sesi_absen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_uid UUID NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  kelas TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sesi_absen ENABLE ROW LEVEL SECURITY;

-- Guru hanya bisa buat dan lihat sesi miliknya sendiri
CREATE POLICY "sesi_select_own" ON public.sesi_absen
  FOR SELECT USING (guru_uid = auth.uid());

CREATE POLICY "sesi_insert_own" ON public.sesi_absen
  FOR INSERT WITH CHECK (guru_uid = auth.uid());

CREATE POLICY "sesi_update_own" ON public.sesi_absen
  FOR UPDATE USING (guru_uid = auth.uid());

-- Tabel kehadiran
CREATE TABLE IF NOT EXISTS public.kehadiran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sesi_absen(id),
  student_id UUID NOT NULL REFERENCES public.siswa(id),
  nama_lengkap TEXT NOT NULL,
  nis TEXT NOT NULL,
  kelas TEXT NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kehadiran ENABLE ROW LEVEL SECURITY;

-- Semua guru yang login bisa baca kehadiran
-- Write hanya dari sesi milik guru sendiri
CREATE POLICY "kehadiran_select_authenticated" ON public.kehadiran
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "kehadiran_insert_authenticated" ON public.kehadiran
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.sesi_absen
      WHERE id = session_id
      AND guru_uid = auth.uid()
    )
  );
