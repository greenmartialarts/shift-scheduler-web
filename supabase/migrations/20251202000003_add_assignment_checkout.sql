-- Add checked_out_at to assignments
alter table assignments add column checked_out_at timestamp with time zone;
