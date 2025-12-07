-- Create event_admins table
create table event_admins (
    event_id uuid references events(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text default 'admin' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (event_id, user_id)
);

-- Enable RLS on event_admins
alter table event_admins enable row level security;

-- Create event_invitations table
create table event_invitations (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid references events(id) on delete cascade not null,
    email text not null,
    status text check (status in ('pending', 'accepted', 'declined')) default 'pending' not null,
    token uuid default uuid_generate_v4() not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null
);

-- Enable RLS on event_invitations
alter table event_invitations enable row level security;

-- Backfill existing event owners into event_admins
insert into event_admins (event_id, user_id, role)
select id, user_id, 'admin'
from events;

-- Drop old RLS policies
drop policy if exists "Users can view their own events" on events;
drop policy if exists "Users can insert their own events" on events;
drop policy if exists "Users can update their own events" on events;
drop policy if exists "Users can delete their own events" on events;

drop policy if exists "Users can view volunteers for their events" on volunteers;
drop policy if exists "Users can insert volunteers for their events" on volunteers;
drop policy if exists "Users can update volunteers for their events" on volunteers;
drop policy if exists "Users can delete volunteers for their events" on volunteers;

drop policy if exists "Users can view shifts for their events" on shifts;
drop policy if exists "Users can insert shifts for their events" on shifts;
drop policy if exists "Users can update shifts for their events" on shifts;
drop policy if exists "Users can delete shifts for their events" on shifts;

drop policy if exists "Users can view assignments for their events" on assignments;
drop policy if exists "Users can insert assignments for their events" on assignments;
drop policy if exists "Users can update assignments for their events" on assignments;
drop policy if exists "Users can delete assignments for their events" on assignments;

-- Create new RLS policies for event_admins
create policy "Admins can view admins for their events"
  on event_admins for select
  using (
    exists (
      select 1 from event_admins as ea
      where ea.event_id = event_admins.event_id
      and ea.user_id = auth.uid()
    )
  );

-- Only existing admins can insert new admins (invite acceptance will use a different mechanism or this policy needs adjustment/bypass)
-- For now, let's allow admins to manage admins.
create policy "Admins can insert admins to their events"
    on event_admins for insert
    with check (
        exists (
            select 1 from event_admins as ea
            where ea.event_id = event_admins.event_id
            and ea.user_id = auth.uid()
            and ea.role = 'admin'
        )
    );
            
create policy "Admins can delete admins from their events"
    on event_admins for delete
    using (
        exists (
            select 1 from event_admins as ea
            where ea.event_id = event_admins.event_id
            and ea.user_id = auth.uid()
        )
    );


-- New Policies for Events
create policy "Admins can view events"
  on events for select
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = events.id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Users can insert events"
  on events for insert
  with check (auth.uid() = user_id); 
  -- Note: After insert, the creator must be added to event_admins. 
  -- We'll handle this in the application or a trigger. 
  -- For now, we assume the app inserts into event_admins immediately after creation.

create policy "Admins can update events"
  on events for update
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = events.id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can delete events"
  on events for delete
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = events.id
      and event_admins.user_id = auth.uid()
    )
  );

-- New Policies for Volunteers
create policy "Admins can view volunteers"
  on volunteers for select
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = volunteers.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can insert volunteers"
  on volunteers for insert
  with check (
    exists (
      select 1 from event_admins
      where event_admins.event_id = volunteers.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can update volunteers"
  on volunteers for update
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = volunteers.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can delete volunteers"
  on volunteers for delete
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = volunteers.event_id
      and event_admins.user_id = auth.uid()
    )
  );

-- New Policies for Shifts
create policy "Admins can view shifts"
  on shifts for select
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = shifts.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can insert shifts"
  on shifts for insert
  with check (
    exists (
      select 1 from event_admins
      where event_admins.event_id = shifts.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can update shifts"
  on shifts for update
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = shifts.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can delete shifts"
  on shifts for delete
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = shifts.event_id
      and event_admins.user_id = auth.uid()
    )
  );

-- New Policies for Assignments
create policy "Admins can view assignments"
  on assignments for select
  using (
    exists (
      select 1 from shifts
      join event_admins on event_admins.event_id = shifts.event_id
      where shifts.id = assignments.shift_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can insert assignments"
  on assignments for insert
  with check (
    exists (
      select 1 from shifts
      join event_admins on event_admins.event_id = shifts.event_id
      where shifts.id = assignments.shift_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can update assignments"
  on assignments for update
  using (
    exists (
      select 1 from shifts
      join event_admins on event_admins.event_id = shifts.event_id
      where shifts.id = assignments.shift_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can delete assignments"
  on assignments for delete
  using (
    exists (
      select 1 from shifts
      join event_admins on event_admins.event_id = shifts.event_id
      where shifts.id = assignments.shift_id
      and event_admins.user_id = auth.uid()
    )
  );

-- Policies for Invitations
-- Admins can view invitations for their events
create policy "Admins can view invitations"
  on event_invitations for select
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = event_invitations.event_id
      and event_admins.user_id = auth.uid()
    )
    OR
    (email = (select email from auth.users where id = auth.uid())) -- User can see their own invites
  );

create policy "Admins can create invitations"
  on event_invitations for insert
  with check (
    exists (
      select 1 from event_admins
      where event_admins.event_id = event_invitations.event_id
      and event_admins.user_id = auth.uid()
    )
  );

create policy "Admins can delete invitations"
  on event_invitations for delete
  using (
    exists (
      select 1 from event_admins
      where event_admins.event_id = event_invitations.event_id
      and event_admins.user_id = auth.uid()
    )
    OR
    (email = (select email from auth.users where id = auth.uid())) -- User can delete (decline/accept) their own invite
  );
