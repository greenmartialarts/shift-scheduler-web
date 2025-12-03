-- Create assets table
create table assets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events on delete cascade not null,
  name text not null,
  type text not null, -- e.g. "Radio", "Vest", "Key"
  identifier text, -- e.g. "Radio #1", "Key 102"
  status text default 'available', -- 'available', 'assigned', 'maintenance', 'lost'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create asset_assignments table
create table asset_assignments (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets on delete cascade not null,
  volunteer_id uuid references volunteers on delete cascade not null,
  checked_out_at timestamp with time zone default timezone('utc'::text, now()) not null,
  checked_in_at timestamp with time zone,
  notes text
);

-- Enable RLS
alter table assets enable row level security;
alter table asset_assignments enable row level security;

-- Policies for assets
create policy "Users can view assets for their events"
  on assets for select
  using (exists (select 1 from events where events.id = assets.event_id and events.user_id = auth.uid()));

create policy "Users can insert assets for their events"
  on assets for insert
  with check (exists (select 1 from events where events.id = assets.event_id and events.user_id = auth.uid()));

create policy "Users can update assets for their events"
  on assets for update
  using (exists (select 1 from events where events.id = assets.event_id and events.user_id = auth.uid()));

create policy "Users can delete assets for their events"
  on assets for delete
  using (exists (select 1 from events where events.id = assets.event_id and events.user_id = auth.uid()));

-- Policies for asset_assignments
create policy "Users can view asset assignments for their events"
  on asset_assignments for select
  using (exists (
    select 1 from assets
    join events on events.id = assets.event_id
    where assets.id = asset_assignments.asset_id and events.user_id = auth.uid()
  ));

create policy "Users can insert asset assignments for their events"
  on asset_assignments for insert
  with check (exists (
    select 1 from assets
    join events on events.id = assets.event_id
    where assets.id = asset_assignments.asset_id and events.user_id = auth.uid()
  ));

create policy "Users can update asset assignments for their events"
  on asset_assignments for update
  using (exists (
    select 1 from assets
    join events on events.id = assets.event_id
    where assets.id = asset_assignments.asset_id and events.user_id = auth.uid()
  ));

create policy "Users can delete asset assignments for their events"
  on asset_assignments for delete
  using (exists (
    select 1 from assets
    join events on events.id = assets.event_id
    where assets.id = asset_assignments.asset_id and events.user_id = auth.uid()
  ));
