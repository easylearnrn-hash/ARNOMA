-- ═══════════════════════════════════════════════════════════════════
-- 🔧 COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════════════
-- This fixes: "Could not find the 'gmailId' column" PGRST204 error
-- ═══════════════════════════════════════════════════════════════════

-- Core Fields (gmail_id fixes the PGRST204 error)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gmail_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_name_raw TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_email_raw TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS message TEXT;

-- Display Fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS student_email TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Linking Metadata (Manual Override)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS linked_student_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS manually_linked BOOLEAN DEFAULT FALSE;

-- Resolution Metadata (Auto-Match)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS derived_student_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS resolved_student_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS derived_student_group TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS resolution_source TEXT DEFAULT 'none';

-- Status & Audit
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unmatched';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS ignored_once BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS ignore_permanently BOOLEAN DEFAULT FALSE;

-- Timestamps
ALTER TABLE payments ADD COLUMN IF NOT EXISTS email_date TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS date_modified_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_payments_gmail_id ON payments(gmail_id);
CREATE INDEX IF NOT EXISTS idx_payments_linked_student ON payments(linked_student_id);
CREATE INDEX IF NOT EXISTS idx_payments_derived_student ON payments(derived_student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- CRITICAL: Refresh PostgREST Cache
NOTIFY pgrst, 'reload schema';

-- Verify Success
SELECT '✅ Schema updated! Test your app now.' as status;
