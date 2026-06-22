-- Restrict SELECT access on contact_submissions to users in the event_admins table
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

CREATE POLICY "Allow admins to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_admins
    WHERE event_admins.user_id = auth.uid()
  )
);
