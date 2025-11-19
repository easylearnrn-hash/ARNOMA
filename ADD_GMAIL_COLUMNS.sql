-- Change user_id from UUID to VARCHAR to support 'admin' value
ALTER TABLE gmail_credentials
ALTER COLUMN user_id TYPE VARCHAR(255);

-- Add missing columns to gmail_credentials table
ALTER TABLE gmail_credentials
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_secret TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT;

-- Update existing rows with the client credentials
UPDATE gmail_credentials
SET
  client_id = '67231383915-4kpdv0k6u517admvhl7jlejku7qtbsjj.apps.googleusercontent.com',
  client_secret = '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'
WHERE client_id IS NULL OR client_secret IS NULL;
