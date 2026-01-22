-- Performance optimization: Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_id ON public.activity_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_assets_event_id ON public.assets(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_event_id ON public.volunteers(event_id);
CREATE INDEX IF NOT EXISTS idx_shifts_event_id ON public.shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_assignments_shift_id ON public.assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer_id ON public.assignments(volunteer_id);
