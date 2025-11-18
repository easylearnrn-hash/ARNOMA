-- ============================================================================
-- GMAIL TOKEN REFRESH - Supabase Table Setup
-- ============================================================================
-- This table stores Gmail OAuth2 refresh tokens securely in Supabase
-- Enables automatic token refresh without user re-authentication
-- ============================================================================

-- Create gmail_credentials table
CREATE TABLE IF NOT EXISTS gmail_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own credentials
CREATE POLICY "Users can view their own gmail credentials"
  ON gmail_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gmail credentials"
  ON gmail_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gmail credentials"
  ON gmail_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gmail credentials"
  ON gmail_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmail_credentials_user_id ON gmail_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_credentials_expires_at ON gmail_credentials(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gmail_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS gmail_credentials_updated_at ON gmail_credentials;
CREATE TRIGGER gmail_credentials_updated_at
  BEFORE UPDATE ON gmail_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_gmail_credentials_updated_at();

-- ============================================================================
-- USAGE INSTRUCTIONS:
-- ============================================================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Deploy the gmail-refresh-token Edge Function (see GMAIL_TOKEN_REFRESH_EDGE_FUNCTION.js)
-- 3. Update index.html to use authorization code flow instead of implicit flow
-- 4. Store refresh_token in Supabase after OAuth callback
-- 5. Call Edge Function to refresh token when access_token expires
-- ============================================================================

-- Test query to check table
-- SELECT * FROM gmail_credentials WHERE user_id = auth.uid();
