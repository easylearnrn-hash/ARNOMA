-- Supabase Payments Table Schema Update
-- Add missing columns for full payment resolution tracking
-- Run this in Supabase SQL Editor

-- Add core payment columns (in case table is minimal)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS gmail_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL,
  ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ NOT NULL,
  ADD COLUMN IF NOT EXISTS payer_name_raw TEXT,
  ADD COLUMN IF NOT EXISTS payer_email_raw TEXT,
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Add display/computed fields
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payer_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS student_email TEXT,
  ADD COLUMN IF NOT EXISTS group_id TEXT,
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unmatched';

-- Add linking/resolution metadata columns
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS linked_student_id TEXT,
  ADD COLUMN IF NOT EXISTS manually_linked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS resolution_source TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS derived_student_id TEXT,
  ADD COLUMN IF NOT EXISTS resolved_student_name TEXT,
  ADD COLUMN IF NOT EXISTS derived_student_group TEXT;

-- Add audit/tracking columns  
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS ignored_once BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ignore_permanently BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT FALSE;

-- Add timestamp columns
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS email_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS date_modified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_gmail_id ON payments(gmail_id);
CREATE INDEX IF NOT EXISTS idx_payments_linked_student ON payments(linked_student_id);
CREATE INDEX IF NOT EXISTS idx_payments_derived_student ON payments(derived_student_id);
CREATE INDEX IF NOT EXISTS idx_payments_resolution_source ON payments(resolution_source);
CREATE INDEX IF NOT EXISTS idx_payments_email_date ON payments(email_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);

-- Add foreign key constraint (optional - uncomment if you want referential integrity)
-- ALTER TABLE payments
--   ADD CONSTRAINT fk_linked_student 
--   FOREIGN KEY (linked_student_id) 
--   REFERENCES students(id) 
--   ON DELETE SET NULL;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
