-- ============================================================================
-- ARNOMA Notification Center - Supabase Table Setup
-- ============================================================================
-- This script creates the necessary tables for the Notification Center feature
-- Run this in your Supabase SQL Editor to set up the notification system
-- ============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    student_name VARCHAR(255),
    group_name VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Los_Angeles'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Los_Angeles'::text, now()) NOT NULL
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON public.notifications(timestamp DESC);

-- Create index on read status for filtering unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Create index on type for filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Create index on student_name for student-specific queries
CREATE INDEX IF NOT EXISTS idx_notifications_student_name ON public.notifications(student_name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
-- For public access (no authentication required):
CREATE POLICY "Allow all operations on notifications" ON public.notifications
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- If you want to restrict to authenticated users only, use this instead:
-- CREATE POLICY "Allow authenticated users" ON public.notifications
--     FOR ALL
--     USING (auth.role() = 'authenticated')
--     WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- Notification Types Reference
-- ============================================================================
-- The following notification types are used in the application:
-- - email: Email sent (manual or automated)
-- - payment: Payment record created/updated
-- - update: General update to student/group data
-- - reminder: Payment reminder sent
-- - system: System events and operations
-- - status_change: Student status changed (Active/Paused/Graduated)
-- - group_change: Student moved to different group
-- - schedule_update: Group schedule modified
-- - absence: Student marked absent
-- ============================================================================

-- Optional: Create a function to auto-delete old notifications (keep last 1000)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE id NOT IN (
        SELECT id
        FROM public.notifications
        ORDER BY timestamp DESC
        LIMIT 1000
    );
END;
$$;

-- Optional: Schedule automatic cleanup (run weekly)
-- Note: You'll need to set this up in Supabase Dashboard under Database > Functions
-- or use pg_cron extension if available

-- ============================================================================
-- Sample Data Queries
-- ============================================================================

-- View all notifications (most recent first)
-- SELECT * FROM public.notifications ORDER BY timestamp DESC LIMIT 50;

-- View unread notifications only
-- SELECT * FROM public.notifications WHERE read = false ORDER BY timestamp DESC;

-- View notifications by type
-- SELECT * FROM public.notifications WHERE type = 'reminder' ORDER BY timestamp DESC;

-- View notifications for specific student
-- SELECT * FROM public.notifications WHERE student_name = 'John Doe' ORDER BY timestamp DESC;

-- Mark all notifications as read
-- UPDATE public.notifications SET read = true WHERE read = false;

-- Delete notifications older than 30 days
-- DELETE FROM public.notifications WHERE timestamp < NOW() - INTERVAL '30 days';

-- Get notification count by type
-- SELECT type, COUNT(*) as count FROM public.notifications GROUP BY type ORDER BY count DESC;

-- ============================================================================
-- End of Setup Script
-- ============================================================================
