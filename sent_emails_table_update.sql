-- ============================================================================
-- ARNOMA Email System - Update sent_emails Table
-- ============================================================================
-- This script adds the html_content column to store the exact email sent
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add html_content column to store the full HTML email that was sent
ALTER TABLE public.sent_emails 
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add index for faster queries on sent_at
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON public.sent_emails(sent_at DESC);

-- Add index for filtering by template
CREATE INDEX IF NOT EXISTS idx_sent_emails_template ON public.sent_emails(template_name);

-- Add index for searching by recipient
CREATE INDEX IF NOT EXISTS idx_sent_emails_recipient ON public.sent_emails(recipient_email);

-- Optional: Create a function to clean up old sent emails (keep last 500)
CREATE OR REPLACE FUNCTION cleanup_old_sent_emails()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.sent_emails
    WHERE id NOT IN (
        SELECT id
        FROM public.sent_emails
        ORDER BY sent_at DESC
        LIMIT 500
    );
END;
$$;

-- ============================================================================
-- Sample Queries
-- ============================================================================

-- View all sent emails with HTML content
-- SELECT id, recipient_email, subject, template_name, sent_at, 
--        LENGTH(html_content) as html_size 
-- FROM public.sent_emails 
-- ORDER BY sent_at DESC 
-- LIMIT 20;

-- View a specific email's HTML content
-- SELECT html_content FROM public.sent_emails WHERE id = 123;

-- Count emails by template
-- SELECT template_name, COUNT(*) as count 
-- FROM public.sent_emails 
-- GROUP BY template_name 
-- ORDER BY count DESC;

-- Find emails sent to specific recipient
-- SELECT * FROM public.sent_emails 
-- WHERE recipient_email = 'student@example.com' 
-- ORDER BY sent_at DESC;

-- Delete all sent emails older than 90 days
-- DELETE FROM public.sent_emails 
-- WHERE sent_at < NOW() - INTERVAL '90 days';

-- Get total emails sent per day (last 30 days)
-- SELECT DATE(sent_at) as date, COUNT(*) as emails_sent
-- FROM public.sent_emails
-- WHERE sent_at > NOW() - INTERVAL '30 days'
-- GROUP BY DATE(sent_at)
-- ORDER BY date DESC;

-- ============================================================================
-- End of Update Script
-- ============================================================================
