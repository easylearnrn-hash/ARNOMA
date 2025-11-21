-- Fix RLS for gmail_credentials table
-- This allows Edge Functions (using service role key) to insert/update

-- Option 1: Disable RLS entirely (simplest for internal tools)
ALTER TABLE gmail_credentials DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, add a permissive policy
-- ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow service role full access"
-- ON gmail_credentials
-- FOR ALL
-- TO service_role
-- USING (true)
-- WITH CHECK (true);
