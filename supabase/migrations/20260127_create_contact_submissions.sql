-- Create contact submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (anonymous submissions)
CREATE POLICY "Allow public to insert contact submissions"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated admins to view submissions (optional but recommended)
CREATE POLICY "Allow authenticated users to view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (true);
