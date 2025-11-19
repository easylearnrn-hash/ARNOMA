-- ============================================================================
-- USER PREFERENCES TABLE - Cloud-synced settings across all devices
-- ============================================================================

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Gmail Timezone Fix Settings
  timezone_offset_winter BOOLEAN DEFAULT false,  -- Winter: -12 hours
  timezone_offset_summer BOOLEAN DEFAULT false,  -- Summer: -11 hours (DST)
  
  -- Future: Add more user preferences here
  -- auto_refresh_enabled BOOLEAN DEFAULT false,
  -- default_view TEXT DEFAULT 'calendar',
  -- theme TEXT DEFAULT 'dark',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference row per user
  CONSTRAINT one_preference_per_user UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. This will create the user_preferences table
-- 3. Each user gets ONE row with their synced preferences
-- 4. Changes sync instantly across all devices
-- 5. Protected by Row Level Security (RLS)
-- ============================================================================
