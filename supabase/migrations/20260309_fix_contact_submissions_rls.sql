-- Restrict SELECT access on contact_submissions to only event admins
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

CREATE POLICY "Allow event admins to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.event_admins
    WHERE event_admins.user_id = auth.uid()
  )
);
