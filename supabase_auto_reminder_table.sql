-- Create table for auto-reminder pause state
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS auto_reminder_paused (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  paused BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_auto_reminder_paused_student_id 
ON auto_reminder_paused(student_id);

-- Enable Row Level Security (RLS)
ALTER TABLE auto_reminder_paused ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on auto_reminder_paused" 
ON auto_reminder_paused 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON auto_reminder_paused TO anon;
GRANT ALL ON auto_reminder_paused TO authenticated;
GRANT ALL ON auto_reminder_paused TO service_role;

-- Comments
COMMENT ON TABLE auto_reminder_paused IS 'Stores pause state for automatic payment reminders per student';
COMMENT ON COLUMN auto_reminder_paused.student_id IS 'Student ID from students table';
COMMENT ON COLUMN auto_reminder_paused.paused IS 'True if auto-reminders are paused for this student';
COMMENT ON COLUMN auto_reminder_paused.updated_at IS 'Last time pause state was changed';
