-- Restrict contact_submissions SELECT access to administrative roles
-- This prevents any authenticated user from seeing all submissions

-- 1. Drop existing permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON public.contact_submissions;

-- 2. Create restricted policy for event admins
CREATE POLICY "Allow administrative users to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM event_admins
        WHERE event_admins.user_id = auth.uid()
    )
);
