-- Add created_at column to students table
-- This will track when each student was added to the system

-- Step 1: Add the column (nullable for now to handle existing students)
ALTER TABLE students
ADD COLUMN created_at TIMESTAMPTZ;

-- Step 2: Set default for new students going forward
ALTER TABLE students
ALTER COLUMN created_at SET DEFAULT now();

-- Step 3: Update existing students to use a reasonable default
-- Option A: Set all existing students to November 1, 2025 (calendar start date)
UPDATE students
SET created_at = '2025-11-01T00:00:00Z'
WHERE created_at IS NULL;

-- Option B: Set to today for all existing students (uncomment if preferred)
-- UPDATE students
-- SET created_at = now()
-- WHERE created_at IS NULL;

-- Step 4: Verify the column was added
SELECT id, name, created_at
FROM students
ORDER BY id;
