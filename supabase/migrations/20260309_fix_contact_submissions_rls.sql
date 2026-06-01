-- Fix RLS for contact_submissions to restrict access to admins only
-- Previously allowed all authenticated users to view submissions

DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM event_admins
        WHERE event_admins.user_id = auth.uid()
    )
);
