CREATE TABLE IF NOT EXISTS public.guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  mata_pelajaran TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: guru hanya bisa akses data sendiri
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guru_select_own" ON public.guru
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "guru_insert_own" ON public.guru
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "guru_update_own" ON public.guru
  FOR UPDATE USING (auth_user_id = auth.uid());
