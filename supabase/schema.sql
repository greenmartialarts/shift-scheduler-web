-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Events Table
create table events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Volunteers Table
create table volunteers (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events on delete cascade not null,
  name text not null,
  "group" text,
  max_hours float,
  external_id text, -- Optional, for mapping if needed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shifts Table
create table shifts (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  required_groups jsonb default '{}'::jsonb, -- e.g. {"Delegates": 2}
  allowed_groups text[] default '{}',
  excluded_groups text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assignments Table
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  shift_id uuid references shifts on delete cascade not null,
  volunteer_id uuid references volunteers on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(shift_id, volunteer_id) -- Prevent double assignment to same shift
);

-- RLS Policies (Row Level Security)
alter table events enable row level security;
alter table volunteers enable row level security;
alter table shifts enable row level security;
alter table assignments enable row level security;

-- Events Policies
create policy "Users can view their own events"
  on events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own events"
  on events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on events for delete
  using (auth.uid() = user_id);

-- Volunteers Policies (Access via Event -> User)
create policy "Users can view volunteers for their events"
  on volunteers for select
  using (exists (select 1 from events where events.id = volunteers.event_id and events.user_id = auth.uid()));

create policy "Users can insert volunteers for their events"
  on volunteers for insert
  with check (exists (select 1 from events where events.id = volunteers.event_id and events.user_id = auth.uid()));

create policy "Users can update volunteers for their events"
  on volunteers for update
  using (exists (select 1 from events where events.id = volunteers.event_id and events.user_id = auth.uid()));

create policy "Users can delete volunteers for their events"
  on volunteers for delete
  using (exists (select 1 from events where events.id = volunteers.event_id and events.user_id = auth.uid()));

-- Shifts Policies
create policy "Users can view shifts for their events"
  on shifts for select
  using (exists (select 1 from events where events.id = shifts.event_id and events.user_id = auth.uid()));

create policy "Users can insert shifts for their events"
  on shifts for insert
  with check (exists (select 1 from events where events.id = shifts.event_id and events.user_id = auth.uid()));

create policy "Users can update shifts for their events"
  on shifts for update
  using (exists (select 1 from events where events.id = shifts.event_id and events.user_id = auth.uid()));

create policy "Users can delete shifts for their events"
  on shifts for delete
  using (exists (select 1 from events where events.id = shifts.event_id and events.user_id = auth.uid()));

-- Assignments Policies
create policy "Users can view assignments for their events"
  on assignments for select
  using (exists (
    select 1 from shifts
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id and events.user_id = auth.uid()
  ));

create policy "Users can insert assignments for their events"
  on assignments for insert
  with check (exists (
    select 1 from shifts
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id and events.user_id = auth.uid()
  ));

create policy "Users can update assignments for their events"
  on assignments for update
  using (exists (
    select 1 from shifts
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id and events.user_id = auth.uid()
  ));

create policy "Users can delete assignments for their events"
  on assignments for delete
  using (exists (
    select 1 from shifts
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id and events.user_id = auth.uid()
  ));
