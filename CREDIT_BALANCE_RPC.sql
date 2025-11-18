-- Create RPC function to safely increment student credit balance
-- This prevents race conditions when multiple payments are processed simultaneously

CREATE OR REPLACE FUNCTION increment_credit_balance(
  student_id INTEGER,
  amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use atomic UPDATE to increment balance
  UPDATE students
  SET balance = COALESCE(balance, 0) + amount
  WHERE id = student_id;
  
  -- Log the credit addition
  INSERT INTO credit_log (student_id, amount, created_at, source)
  VALUES (student_id, amount, NOW(), 'overpayment')
  ON CONFLICT DO NOTHING;
END;
$$;

-- Optional: Create credit_log table to track all credit additions
CREATE TABLE IF NOT EXISTS credit_log (
  id BIGSERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL, -- 'overpayment', 'manual', 'refund', etc.
  notes TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_log_student ON credit_log(student_id);
CREATE INDEX IF NOT EXISTS idx_credit_log_created ON credit_log(created_at DESC);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_credit_balance TO anon;
GRANT EXECUTE ON FUNCTION increment_credit_balance TO authenticated;
