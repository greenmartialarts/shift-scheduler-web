-- Fix contact_submissions RLS to restrict access to event admins only
-- This prevents any authenticated user from seeing all contact submissions.

DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

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
