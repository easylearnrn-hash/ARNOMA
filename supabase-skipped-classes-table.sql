-- ============================================================================
-- SUPABASE TABLE: skipped_classes
-- Stores skipped class sessions for the Smart Calendar
-- Syncs across all devices in real-time
-- ============================================================================

-- Create table
CREATE TABLE IF NOT EXISTS skipped_classes (
  id BIGSERIAL PRIMARY KEY,
  group_name TEXT NOT NULL,
  class_date DATE NOT NULL,
  skipped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_name, class_date)
);

-- Add index for faster lookups by group
CREATE INDEX IF NOT EXISTS idx_skipped_classes_group_name ON skipped_classes(group_name);

-- Add index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_skipped_classes_class_date ON skipped_classes(class_date);

-- Add composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_skipped_classes_group_date ON skipped_classes(group_name, class_date);

-- Enable Row Level Security (RLS)
ALTER TABLE skipped_classes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
-- For anonymous access (as you're using anon key):
CREATE POLICY "Allow all operations for skipped_classes" ON skipped_classes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- If you want to restrict to authenticated users only:
-- DROP POLICY IF EXISTS "Allow all operations for skipped_classes" ON skipped_classes;
-- CREATE POLICY "Allow authenticated users to manage skipped classes" ON skipped_classes
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Grant permissions
GRANT ALL ON skipped_classes TO anon;
GRANT ALL ON skipped_classes TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE skipped_classes_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE skipped_classes_id_seq TO authenticated;

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Go to your Supabase project: https://supabase.com/dashboard
-- 2. Navigate to: SQL Editor (left sidebar)
-- 3. Click "New Query"
-- 4. Copy and paste this entire SQL script
-- 5. Click "Run" to execute
-- 6. Verify the table was created: Go to "Table Editor" → you should see "skipped_classes"
-- 
-- Your calendar will now sync skipped classes across all devices! 🎉
-- ============================================================================

-- Optional: Add a comment to the table
COMMENT ON TABLE skipped_classes IS 'Stores skipped class sessions for Smart Calendar - syncs across all devices';
COMMENT ON COLUMN skipped_classes.group_name IS 'Name of the group (e.g., A, B, C)';
COMMENT ON COLUMN skipped_classes.class_date IS 'Date of the skipped class (YYYY-MM-DD)';
COMMENT ON COLUMN skipped_classes.skipped_at IS 'When the class was marked as skipped';
COMMENT ON COLUMN skipped_classes.created_at IS 'When this record was created';
