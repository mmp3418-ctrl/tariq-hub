-- منصة طارق / Tariq Platform — Supabase schema (run in SQL Editor)
-- Enables public read + realtime for announcements, grades, and resources.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('primary', 'preparatory', 'secondary')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('pdf', 'playlist')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subject_ar TEXT NOT NULL,
  subject_en TEXT NOT NULL,
  term TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS grades_stage_sort_idx ON grades (stage, sort_order);
CREATE INDEX IF NOT EXISTS resources_grade_type_idx ON resources (grade_id, type);
CREATE INDEX IF NOT EXISTS announcements_active_idx ON announcements (is_active, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read announcements" ON announcements;
CREATE POLICY "Public read announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read grades" ON grades;
CREATE POLICY "Public read grades"
  ON grades FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read resources" ON resources;
CREATE POLICY "Public read resources"
  ON resources FOR SELECT
  TO anon, authenticated
  USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE grades;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;

-- Optional seed announcement (safe to re-run only if table is empty)
INSERT INTO announcements (message_ar, message_en, is_active)
SELECT
  'مرحباً بك في منصة طارق — ابدأ من مرحلتك، ثم افتح ملخصاتك وشروحاتك.',
  'Welcome to Tariq Platform — start from your stage, then open notes and playlists.',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM announcements LIMIT 1);
