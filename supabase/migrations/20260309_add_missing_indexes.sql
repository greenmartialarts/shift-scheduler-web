-- Performance optimization: Add indexes for activity_logs filtering
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Add missing index for volunteer search by email
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers(email);
