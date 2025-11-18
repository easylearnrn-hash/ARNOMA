-- ============================================================================
-- MIGRATION: Add Class Cancellation Support
-- Extends skipped_classes table to support both individual skips and full cancellations
-- Enables payment forwarding for canceled classes
-- ============================================================================

-- ============================================================================
-- PART 1: Update skipped_classes table
-- ============================================================================

-- Add skip_type column to differentiate between student skips and class cancellations
ALTER TABLE skipped_classes
ADD COLUMN IF NOT EXISTS skip_type TEXT DEFAULT 'student-skipped'
CHECK (skip_type IN ('student-skipped', 'class-canceled'));

-- Add note column for optional cancellation reason
ALTER TABLE skipped_classes
ADD COLUMN IF NOT EXISTS note TEXT;

-- Add index for skip_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_skipped_classes_skip_type ON skipped_classes(skip_type);

-- Add composite index for common query pattern (group + date + type)
CREATE INDEX IF NOT EXISTS idx_skipped_classes_group_date_type ON skipped_classes(group_name, class_date, skip_type);

-- Update existing records to have default skip_type
UPDATE skipped_classes
SET skip_type = 'student-skipped'
WHERE skip_type IS NULL;

-- Add comments
COMMENT ON COLUMN skipped_classes.skip_type IS 'Type of skip: student-skipped (individual) or class-canceled (entire class)';
COMMENT ON COLUMN skipped_classes.note IS 'Optional note explaining the cancellation/skip reason';

-- ============================================================================
-- PART 2: Update credit_payments table for payment forwarding
-- ============================================================================

-- Add applied_class_date column (the class date where this payment is actually applied)
-- This allows payments made on canceled dates to be forwarded to next active class
ALTER TABLE credit_payments
ADD COLUMN IF NOT EXISTS applied_class_date DATE;

-- Add payment_date column (the actual date payment was made, different from class_date)
ALTER TABLE credit_payments
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Add note column for payment forwarding tracking
ALTER TABLE credit_payments
ADD COLUMN IF NOT EXISTS note TEXT;

-- Set applied_class_date to class_date for existing records (backward compatibility)
UPDATE credit_payments
SET applied_class_date = class_date
WHERE applied_class_date IS NULL;

-- Set payment_date to applied_at date for existing records
UPDATE credit_payments
SET payment_date = applied_at::DATE
WHERE payment_date IS NULL;

-- Add index for applied_class_date for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_payments_applied_class_date ON credit_payments(applied_class_date);

-- Add composite index for student + applied class date
CREATE INDEX IF NOT EXISTS idx_credit_payments_student_applied_date ON credit_payments(student_id, applied_class_date);

-- Add comments
COMMENT ON COLUMN credit_payments.payment_date IS 'The date when the payment was actually made';
COMMENT ON COLUMN credit_payments.applied_class_date IS 'The class date where this payment is applied (may differ from payment_date if forwarded)';
COMMENT ON COLUMN credit_payments.note IS 'Notes about payment forwarding or other details';

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Go to your Supabase project: https://supabase.com/dashboard
-- 2. Navigate to: SQL Editor (left sidebar)
-- 3. Click "New Query"
-- 4. Copy and paste this entire SQL script
-- 5. Click "Run" to execute
-- 6. Verify: Go to "Table Editor" → check both tables for new columns
-- ============================================================================

-- Summary of changes:
--
-- skipped_classes table:
-- • skip_type: Differentiates between individual skips and full cancellations
-- • note: Optional field for cancellation reasons
-- • Indexes: Improved query performance for skip_type filtering
-- • All existing records migrated to 'student-skipped' type
--
-- credit_payments table:
-- • payment_date: When payment was actually made
-- • applied_class_date: Which class date the payment applies to (enables forwarding)
-- • note: Track payment forwarding and other details
-- • Indexes: Improved query performance
-- • Backward compatibility: Existing records get default values
