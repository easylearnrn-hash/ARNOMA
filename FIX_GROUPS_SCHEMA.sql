-- === FIX ALL RLS POLICIES FOR ARNOMA APP ===
-- Run this in Supabase SQL Editor to fix read/write permissions
-- This ensures your app can read and write to students, groups, and payments tables

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================

-- Disable RLS temporarily to clean up
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anon to read groups" ON groups;
DROP POLICY IF EXISTS "Allow anon to insert groups" ON groups;
DROP POLICY IF EXISTS "Allow anon to update groups" ON groups;
DROP POLICY IF EXISTS "Allow anon to delete groups" ON groups;
DROP POLICY IF EXISTS "Allow anon full access to groups" ON groups;

-- Re-enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create single comprehensive policy for anon access
CREATE POLICY "Allow anon full access to groups"
ON groups
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STUDENTS TABLE
-- ============================================================================

-- Disable RLS temporarily to clean up
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anon to read students" ON students;
DROP POLICY IF EXISTS "Allow anon to insert students" ON students;
DROP POLICY IF EXISTS "Allow anon to update students" ON students;
DROP POLICY IF EXISTS "Allow anon to delete students" ON students;
DROP POLICY IF EXISTS "Allow anon full access to students" ON students;

-- Re-enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create single comprehensive policy for anon access
CREATE POLICY "Allow anon full access to students"
ON students
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

-- Disable RLS temporarily to clean up
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anon to read payments" ON payments;
DROP POLICY IF EXISTS "Allow anon to insert payments" ON payments;
DROP POLICY IF EXISTS "Allow anon to update payments" ON payments;
DROP POLICY IF EXISTS "Allow anon to delete payments" ON payments;
DROP POLICY IF EXISTS "Allow anon full access to payments" ON payments;

-- Re-enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create single comprehensive policy for anon access
CREATE POLICY "Allow anon full access to payments"
ON payments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all tables are accessible
SELECT 'Testing groups table...' as status;
SELECT COUNT(*) as groups_count FROM groups;

SELECT 'Testing students table...' as status;
SELECT COUNT(*) as students_count FROM students;

SELECT 'Testing payments table...' as status;
SELECT COUNT(*) as payments_count FROM payments;

SELECT '✅ All RLS policies fixed! Your app should now be able to read/write all tables.' as status;
