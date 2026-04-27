-- Restrict SELECT access on contact_submissions to authenticated users only
-- Since this is a public-facing submission table, we don't want anyone to be able to read all submissions.

DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

CREATE POLICY "Allow authenticated users to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  -- In a production app, we would ideally check for a 'super_admin' role or similar.
  -- For this application, we allow authenticated users (who are admins of at least one event) to see them.
  -- A more restrictive policy would be better if we had a dedicated global admin role.
  EXISTS (
    SELECT 1 FROM event_admins
    WHERE event_admins.user_id = auth.uid()
  )
);
