-- Add missing performance indexes for frequently filtered/sorted fields
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
