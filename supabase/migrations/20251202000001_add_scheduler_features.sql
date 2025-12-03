-- Create shift_templates table
create table shift_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  duration_hours float not null,
  required_groups jsonb default '{}'::jsonb,
  allowed_groups text[] default '{}',
  excluded_groups text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create volunteer_groups table
create table volunteer_groups (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events on delete cascade not null,
  name text not null,
  color text,
  description text,
  max_hours_default float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, name)
);

-- Add group_id to volunteers
alter table volunteers add column group_id uuid references volunteer_groups(id);

-- Enable RLS
alter table shift_templates enable row level security;
alter table volunteer_groups enable row level security;

-- Policies for shift_templates
create policy "Users can view their own shift templates"
  on shift_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert their own shift templates"
  on shift_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own shift templates"
  on shift_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete their own shift templates"
  on shift_templates for delete
  using (auth.uid() = user_id);

-- Policies for volunteer_groups
create policy "Users can view volunteer groups for their events"
  on volunteer_groups for select
  using (exists (select 1 from events where events.id = volunteer_groups.event_id and events.user_id = auth.uid()));

create policy "Users can insert volunteer groups for their events"
  on volunteer_groups for insert
  with check (exists (select 1 from events where events.id = volunteer_groups.event_id and events.user_id = auth.uid()));

create policy "Users can update volunteer groups for their events"
  on volunteer_groups for update
  using (exists (select 1 from events where events.id = volunteer_groups.event_id and events.user_id = auth.uid()));

create policy "Users can delete volunteer groups for their events"
  on volunteer_groups for delete
  using (exists (select 1 from events where events.id = volunteer_groups.event_id and events.user_id = auth.uid()));

-- Migrate existing groups
do $$
declare
  r record;
  g_id uuid;
begin
  for r in select distinct event_id, "group" from volunteers where "group" is not null loop
    -- Insert group if not exists
    insert into volunteer_groups (event_id, name, color)
    values (r.event_id, r."group", '#3b82f6') -- Default blue color
    on conflict (event_id, name) do nothing;
    
    -- Get the group id
    select id into g_id from volunteer_groups where event_id = r.event_id and name = r."group";
    
    -- Update volunteers
    update volunteers set group_id = g_id where event_id = r.event_id and "group" = r."group";
  end loop;
end $$;
