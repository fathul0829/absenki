CREATE TABLE IF NOT EXISTS public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL,
  nama TEXT NOT NULL,
  jk TEXT,
  nis TEXT NOT NULL,
  nisn TEXT,
  kelas TEXT NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: guru hanya bisa akses data siswanya sendiri
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "siswa_select_own" ON public.siswa
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "siswa_insert_own" ON public.siswa
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "siswa_update_own" ON public.siswa
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "siswa_delete_own" ON public.siswa
  FOR DELETE USING (auth_user_id = auth.uid());


