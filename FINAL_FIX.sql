-- Drop foreign key constraint
ALTER TABLE gmail_credentials DROP CONSTRAINT IF EXISTS gmail_credentials_user_id_fkey;

-- Drop policies that reference user_id column
DROP POLICY IF EXISTS "Users can view their own gmail_credentials on gmail_credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can view their own gmail credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can insert their own gmail credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can update their own gmail credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can delete their own gmail credentials" ON gmail_credentials;

-- Change user_id from UUID to TEXT to accept 'admin' value
ALTER TABLE gmail_credentials ALTER COLUMN user_id TYPE TEXT;

-- Add refresh_token column (missing from current table)
ALTER TABLE gmail_credentials ADD COLUMN IF NOT EXISTS refresh_token TEXT;
