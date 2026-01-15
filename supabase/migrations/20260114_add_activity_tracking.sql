-- Add check-in tracking to assignments
ALTER TABLE assignments 
ADD COLUMN checked_in_at timestamp with time zone,
ADD COLUMN checked_out_at timestamp with time zone;

-- Assets Table
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'available', -- 'available', 'checked_out'
  volunteer_id uuid REFERENCES volunteers ON DELETE SET NULL, -- who has it
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'check_in', 'check_out', 'asset_out', 'asset_in', 'missed_shift', 'late_warning'
  description text NOT NULL,
  volunteer_id uuid REFERENCES volunteers ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Assets Policies
CREATE POLICY "Users can view assets for their events"
  ON assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = assets.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Users can manage assets for their events"
  ON assets FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = assets.event_id AND events.user_id = auth.uid()));

-- Activity Logs Policies
CREATE POLICY "Users can view logs for their events"
  ON activity_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = activity_logs.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Users can insert logs for their events"
  ON activity_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = activity_logs.event_id AND events.user_id = auth.uid()));
