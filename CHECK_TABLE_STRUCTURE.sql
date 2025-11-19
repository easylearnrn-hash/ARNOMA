-- First, check what columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gmail_credentials';
