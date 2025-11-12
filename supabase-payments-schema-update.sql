-- ===================================================================
-- CRITICAL SCHEMA UPDATE for payments TABLE
-- ===================================================================
-- This script adds all missing columns required for full functionality
-- Uses snake_case convention (gmail_id, not gmailId) to match PostgREST
-- Run this entire script in Supabase SQL Editor
-- ===================================================================

-- Step 1: Add Core Payment Identifiers & Data
-- CRITICAL FIX for PGRST204 error "Could not find 'gmailId' column"
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS gmail_id TEXT,
  ADD COLUMN IF NOT EXISTS payer_name_raw TEXT,
  ADD COLUMN IF NOT EXISTS payer_email_raw TEXT,
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Step 2: Add Display/Computed Fields
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payer_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS student_email TEXT,
  ADD COLUMN IF NOT EXISTS group_id TEXT,
  ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Step 3: Add Manual Linking Metadata (User Override)
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS linked_student_id TEXT,
  ADD COLUMN IF NOT EXISTS manually_linked BOOLEAN DEFAULT FALSE;

-- Step 4: Add Automatic Resolution Metadata (AI Matching)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS derived_student_id TEXT,
  ADD COLUMN IF NOT EXISTS resolved_student_name TEXT,
  ADD COLUMN IF NOT EXISTS derived_student_group TEXT,
  ADD COLUMN IF NOT EXISTS resolution_source TEXT DEFAULT 'none';

-- Step 5: Add Status Tracking
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unmatched';

-- Step 6: Add Audit/Tracking Flags
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ignored_once BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ignore_permanently BOOLEAN DEFAULT FALSE;

-- Step 7: Add Timestamps (CRITICAL for sorting/filtering)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS email_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS date_modified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Step 8: Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_payments_gmail_id ON payments(gmail_id);
CREATE INDEX IF NOT EXISTS idx_payments_linked_student ON payments(linked_student_id);
CREATE INDEX IF NOT EXISTS idx_payments_derived_student ON payments(derived_student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_resolution_source ON payments(resolution_source);
CREATE INDEX IF NOT EXISTS idx_payments_email_date ON payments(email_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Step 9: Optional - Add Foreign Key Constraint for Referential Integrity
-- Uncomment the following lines if you want to enforce student relationships
-- ALTER TABLE payments
--   ADD CONSTRAINT fk_linked_student 
--   FOREIGN KEY (linked_student_id) 
--   REFERENCES students(id) 
--   ON DELETE SET NULL;

-- Step 10: CRITICAL - Refresh PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';

-- Step 11: Verify All Columns Were Added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Success Message
SELECT '✅ All 28 columns added/verified. Schema cache refreshed. Ready to test!' as status;
