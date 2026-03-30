-- Add indexes to optimize daily health audit (Data Pulse) queries
-- and general performance for frequently filtered fields

-- 1. Activity Logs: Optimize daily summaries and late warning trends
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- 2. Volunteers: Optimize lookups by email and type
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);

-- 3. Profiles: Optimize lookup by email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
