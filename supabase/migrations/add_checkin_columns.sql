-- Add check-in columns to assignments table
alter table assignments add column if not exists checked_in boolean default false;
alter table assignments add column if not exists late_dismissed boolean default false;
