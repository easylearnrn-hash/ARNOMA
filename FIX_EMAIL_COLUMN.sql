-- Make email column optional (allow NULL)
ALTER TABLE gmail_credentials ALTER COLUMN email DROP NOT NULL;
