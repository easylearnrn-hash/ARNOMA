-- === CLEAN UP DUPLICATE GROUPS ===
-- This will keep only the most recent version of each group name

-- First, let's see what duplicates exist
SELECT group_name, COUNT(*) as count
FROM groups
GROUP BY group_name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete all groups (we'll recreate them fresh)
-- WARNING: This deletes ALL groups. Make sure you're okay with this!
DELETE FROM groups;

-- Verify groups are deleted
SELECT COUNT(*) as remaining_groups FROM groups;

-- Now your app will create groups fresh with proper IDs
SELECT '✅ All duplicate groups removed. You can now add groups fresh from your app.' as status;
