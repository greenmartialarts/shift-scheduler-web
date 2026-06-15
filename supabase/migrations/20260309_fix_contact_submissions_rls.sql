-- Restrict SELECT access on contact_submissions to event admins
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

-- Create a new policy that restricts access to users in the event_admins table
CREATE POLICY "Allow only admins to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_admins
    WHERE event_admins.user_id = auth.uid()
  )
);
