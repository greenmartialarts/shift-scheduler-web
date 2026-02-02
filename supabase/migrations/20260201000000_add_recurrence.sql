-- Add optional recurrence to events for "Generate next occurrence" flow
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_rule text;
-- e.g. 'WEEKLY', 'BIWEEKLY', 'MONTHLY'
