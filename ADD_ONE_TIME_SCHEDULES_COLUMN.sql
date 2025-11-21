-- === ADD ONE-TIME SCHEDULES COLUMN TO GROUPS TABLE ===
-- Run this in Supabase SQL Editor to add support for one-time schedule overrides
-- This allows groups to have temporary schedule changes for specific dates

-- Add the one_time_schedules column to store JSON array of one-time overrides
-- Format: [{"date": "2025-11-21", "day": "Wednesday", "time": "8:00 PM", "oneTime": true}, ...]
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS one_time_schedules JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN groups.one_time_schedules IS 'JSON array of one-time schedule overrides. Each object contains: date (YYYY-MM-DD), day (day name), time (12h format), oneTime (true)';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
  AND column_name = 'one_time_schedules';

SELECT '✅ one_time_schedules column added successfully!' as status;
