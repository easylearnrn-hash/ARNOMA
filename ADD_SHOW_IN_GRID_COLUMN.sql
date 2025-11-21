-- Add show_in_grid column to students table
-- This column controls whether a student appears in the calendar grid
-- Independent of the student's active/paused/graduated status

-- Add the column (defaults to true for existing students)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS show_in_grid BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN students.show_in_grid IS 'Controls calendar visibility - student can be active but hidden from calendar grid';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_students_show_in_grid ON students(show_in_grid);

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'show_in_grid';
