-- =====================================================
-- Supabase Tables for Student Absences & Credit Payments
-- =====================================================
-- Run this in Supabase SQL Editor to enable cloud sync
-- for absent students and credit-applied payments
-- =====================================================

-- 1. CREATE student_absences TABLE
-- Tracks when students are marked absent for specific dates
CREATE TABLE IF NOT EXISTS student_absences (
  id BIGSERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  class_date DATE NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_absences_student_date 
  ON student_absences(student_id, class_date);

CREATE INDEX IF NOT EXISTS idx_student_absences_date 
  ON student_absences(class_date);

-- Enable Row Level Security (RLS)
ALTER TABLE student_absences ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write (since you're using anon key)
CREATE POLICY "Allow anonymous access to student_absences"
  ON student_absences
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 2. CREATE credit_payments TABLE
-- Tracks when student credit/balance is applied to pay for a class
CREATE TABLE IF NOT EXISTS credit_payments (
  id BIGSERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  class_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_date)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_payments_student_date 
  ON credit_payments(student_id, class_date);

CREATE INDEX IF NOT EXISTS idx_credit_payments_date 
  ON credit_payments(class_date);

CREATE INDEX IF NOT EXISTS idx_credit_payments_student 
  ON credit_payments(student_id);

-- Enable Row Level Security (RLS)
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write (since you're using anon key)
CREATE POLICY "Allow anonymous access to credit_payments"
  ON credit_payments
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after creating tables to verify:

-- Check student_absences table structure:
-- SELECT * FROM student_absences LIMIT 10;

-- Check credit_payments table structure:
-- SELECT * FROM credit_payments LIMIT 10;

-- Count records:
-- SELECT COUNT(*) as total_absences FROM student_absences;
-- SELECT COUNT(*) as total_credit_payments FROM credit_payments;
