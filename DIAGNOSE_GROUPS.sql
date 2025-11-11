-- === DIAGNOSE GROUPS TABLE ===
-- Run this in Supabase SQL Editor to see what's wrong

-- 1. Check if groups table exists and see its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'groups'
ORDER BY ordinal_position;

-- 2. See all groups currently in the table
SELECT * FROM groups;

-- 3. Count how many groups exist
SELECT COUNT(*) as total_groups FROM groups;
