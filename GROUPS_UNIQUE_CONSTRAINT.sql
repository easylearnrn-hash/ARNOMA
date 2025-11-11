-- === ENFORCE UNIQUE GROUP NAMES AND CLEAN DUPLICATES ===
-- 1) Keep the most recently updated/created row per group_name
WITH ranked AS (
  SELECT id, group_name,
         ROW_NUMBER() OVER (
           PARTITION BY group_name
           ORDER BY COALESCE(updated_at, created_at) DESC NULLS LAST
         ) AS rn
  FROM groups
)
DELETE FROM groups g
USING ranked r
WHERE g.id = r.id
  AND r.rn > 1;

-- 2) Add a unique constraint on group_name to prevent future duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_groups_group_name'
  ) THEN
    ALTER TABLE groups
    ADD CONSTRAINT uq_groups_group_name UNIQUE (group_name);
  END IF;
END $$;

-- 3) Verify
SELECT group_name, COUNT(*) AS count
FROM groups
GROUP BY group_name
ORDER BY count DESC;

SELECT '✅ Duplicates removed and uniqueness enforced on group_name' AS status;