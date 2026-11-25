-- =========================================================================
-- Supabase Database Schema & Storage Setup for Paravoor Complex Sargamela 2026
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Madrasa Points Table (updated manually from admin)
CREATE TABLE IF NOT EXISTS public.madrasa_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points NUMERIC NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.madrasa_points ENABLE ROW LEVEL SECURITY;

-- Allow public read & write (or write restricted by key)
DROP POLICY IF EXISTS "Public read madrasa_points" ON public.madrasa_points;
CREATE POLICY "Public read madrasa_points" ON public.madrasa_points FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write madrasa_points" ON public.madrasa_points;
CREATE POLICY "Allow write madrasa_points" ON public.madrasa_points FOR ALL USING (true);

-- Insert initial 4 Madrasas of Paravoor Complex
INSERT INTO public.madrasa_points (id, name, points, display_order)
VALUES 
  ('purayar', 'പുറയാർ', 0, 1),
  ('manjali', 'മാഞ്ഞാലി', 0, 2),
  ('alamthuruth', 'ആളംത്തുരുത്ത്', 0, 3),
  ('parana', 'പാറാന', 0, 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Program Results Table (Program IDs 1 to 63 with PDF URL)
CREATE TABLE IF NOT EXISTS public.program_results (
  program_id INT PRIMARY KEY,
  program_name TEXT NOT NULL,
  category TEXT NOT NULL,
  pdf_url TEXT,
  pdf_name TEXT,
  status TEXT DEFAULT 'pending',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.program_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read program_results" ON public.program_results;
CREATE POLICY "Public read program_results" ON public.program_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write program_results" ON public.program_results;
CREATE POLICY "Allow write program_results" ON public.program_results FOR ALL USING (true);

-- 3. Site Settings Table (Hadeeth, Individual Champions, QR Code)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write site_settings" ON public.site_settings;
CREATE POLICY "Allow write site_settings" ON public.site_settings FOR ALL USING (true);

-- Default Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('hadeeth', '{"arabic": "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", "malayalam": "ആരെങ്കിലും അറിവ് തേടി ഒരു വഴിയിലൂടെ സഞ്ചരിച്ചാൽ, അല്ലാഹു അവന് സ്വർഗ്ഗത്തിലേക്കുള്ള വഴി എളുപ്പമാക്കിക്കൊടുക്കും.", "reference": "സ്വഹീഹ് മുസ്‌ലിം: 2699", "enabled": true}'::jsonb),
  ('individual_champions', '{"enabled": false, "champions": []}'::jsonb),
  ('qr_code', '{"url": "https://paravoor-sargamela.msmernakulam.in/", "enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Storage Bucket Setup for PDF files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sargamela-results', 'sargamela-results', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public bucket access" ON storage.objects;
CREATE POLICY "Public bucket access" ON storage.objects
  FOR SELECT USING (bucket_id = 'sargamela-results');

DROP POLICY IF EXISTS "Public bucket upload" ON storage.objects;
CREATE POLICY "Public bucket upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sargamela-results');

DROP POLICY IF EXISTS "Public bucket update" ON storage.objects;
CREATE POLICY "Public bucket update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sargamela-results');

DROP POLICY IF EXISTS "Public bucket delete" ON storage.objects;
CREATE POLICY "Public bucket delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'sargamela-results');
