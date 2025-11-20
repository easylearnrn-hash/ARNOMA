-- Add active column to groups table
-- This column controls whether a group appears in dropdowns, Quick View, and student cards
-- Independent of whether the group has a schedule

-- Add the column (defaults to true for existing groups)
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN groups.active IS 'Controls group visibility - inactive groups are hidden from UI but data is preserved';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_groups_active ON groups(active);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'groups' AND column_name = 'active';
