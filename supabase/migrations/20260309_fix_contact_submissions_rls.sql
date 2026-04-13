-- Fix contact submissions RLS to restrict SELECT access to admins only
-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

-- Create a more restrictive policy that only allows event admins to view submissions
-- Since contact_submissions table doesn't have an event_id, we'll restrict it to users
-- who are listed in the event_admins table (global admins/multi-admin system)
CREATE POLICY "Allow admins to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.event_admins
        WHERE user_id = auth.uid()
    )
);
