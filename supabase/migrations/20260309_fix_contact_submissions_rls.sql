-- Drop the existing overly-permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

-- Restrict SELECT access to event admins
-- Since this is a global table (not tied to a specific event_id yet),
-- we allow any user who is an admin of at least one event to view all submissions.
CREATE POLICY "Allow event admins to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM event_admins
        WHERE user_id = auth.uid()
    )
);
