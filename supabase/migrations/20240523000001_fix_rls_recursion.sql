-- Create a security definer function to check admin status
-- This bypasses RLS on event_admins to prevent recursion

-- Drop first to avoid parameter name conflict errors if it exists with different params
drop function if exists public.is_event_admin(uuid);

create or replace function public.is_event_admin(lookup_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public -- Secure the function
as $$
begin
  return exists (
    select 1 from event_admins
    where event_id = lookup_event_id
    and user_id = auth.uid()
  );
end;
$$;

-- Update Events Policies to check Owner OR Admin
-- This ensures the creator can always access the event even before being added as admin
drop policy if exists "Admins can view events" on events;
drop policy if exists "Users can insert events" on events;
drop policy if exists "Admins can update events" on events;
drop policy if exists "Admins can delete events" on events;

create policy "Admins and Owners can view events"
  on events for select
  using (
    auth.uid() = user_id OR is_event_admin(id)
  );

create policy "Users can insert events"
  on events for insert
  with check (auth.uid() = user_id);

create policy "Admins and Owners can update events"
  on events for update
  using (
    auth.uid() = user_id OR is_event_admin(id)
  );

create policy "Admins and Owners can delete events"
  on events for delete
  using (
    auth.uid() = user_id OR is_event_admin(id)
  );

-- Update Event Admins Policies
-- Use the function for the recursive check
drop policy if exists "Admins can view admins for their events" on event_admins;
drop policy if exists "Admins can insert admins to their events" on event_admins;
drop policy if exists "Admins can delete admins from their events" on event_admins;

create policy "Admins and Owners can view event admins"
  on event_admins for select
  using (
    -- I can see the list if I am an Admin OR if I am the Owner of the event
    is_event_admin(event_id) 
    OR 
    exists (select 1 from events where id = event_admins.event_id and user_id = auth.uid())
  );

create policy "Admins and Owners can insert event admins"
  on event_admins for insert
  with check (
    -- Allow insert if I am currently an admin OR if I am the Owner (bootstrapping first admin)
    is_event_admin(event_id)
    OR 
    exists (select 1 from events where id = event_admins.event_id and user_id = auth.uid())
  );

create policy "Admins and Owners can delete event admins"
  on event_admins for delete
  using (
    is_event_admin(event_id)
    OR 
    exists (select 1 from events where id = event_admins.event_id and user_id = auth.uid())
  );

-- Update Child Tables (Volunteers, Shifts, Assignments, Invitations)
-- Use the secure function instead of raw subquery to likely improve performance and safety

drop policy if exists "Admins can view volunteers" on volunteers;
drop policy if exists "Admins can insert volunteers" on volunteers;
drop policy if exists "Admins can update volunteers" on volunteers;
drop policy if exists "Admins can delete volunteers" on volunteers;

-- Volunteers
create policy "Admins and Owners can view volunteers" on volunteers for select
  using ( exists (select 1 from events where id = volunteers.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

create policy "Admins and Owners can insert volunteers" on volunteers for insert
  with check ( exists (select 1 from events where id = volunteers.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

create policy "Admins and Owners can update volunteers" on volunteers for update
  using ( exists (select 1 from events where id = volunteers.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

create policy "Admins and Owners can delete volunteers" on volunteers for delete
  using ( exists (select 1 from events where id = volunteers.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

-- Shifts
drop policy if exists "Admins can view shifts" on shifts;
drop policy if exists "Admins can insert shifts" on shifts;
drop policy if exists "Admins can update shifts" on shifts;
drop policy if exists "Admins can delete shifts" on shifts;

create policy "Admins and Owners can view shifts" on shifts for select
  using ( exists (select 1 from events where id = shifts.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

create policy "Admins and Owners can insert shifts" on shifts for insert
  with check ( exists (select 1 from events where id = shifts.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

create policy "Admins and Owners can update shifts" on shifts for update
  using ( exists (select 1 from events where id = shifts.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

create policy "Admins and Owners can delete shifts" on shifts for delete
  using ( exists (select 1 from events where id = shifts.event_id and (user_id = auth.uid() OR is_event_admin(id))) );

-- Assignments (via Shifts)
-- This query is complex, let's keep it safe. 
-- We check if the associated shift belongs to an event we can manage.
drop policy if exists "Admins can view assignments" on assignments;
drop policy if exists "Admins can insert assignments" on assignments;
drop policy if exists "Admins can update assignments" on assignments;
drop policy if exists "Admins can delete assignments" on assignments;

create policy "Admins and Owners can view assignments" on assignments for select
  using ( exists (
    select 1 from shifts 
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id 
    and (events.user_id = auth.uid() OR is_event_admin(events.id))
  ));

create policy "Admins and Owners can insert assignments" on assignments for insert
  with check ( exists (
    select 1 from shifts 
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id 
    and (events.user_id = auth.uid() OR is_event_admin(events.id))
  ));

create policy "Admins and Owners can update assignments" on assignments for update
  using ( exists (
    select 1 from shifts 
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id 
    and (events.user_id = auth.uid() OR is_event_admin(events.id))
  ));

create policy "Admins and Owners can delete assignments" on assignments for delete
  using ( exists (
    select 1 from shifts 
    join events on events.id = shifts.event_id
    where shifts.id = assignments.shift_id 
    and (events.user_id = auth.uid() OR is_event_admin(events.id))
  ));

-- Invitations
drop policy if exists "Admins can view invitations" on event_invitations;
drop policy if exists "Admins can create invitations" on event_invitations;
drop policy if exists "Admins can delete invitations" on event_invitations;

create policy "Admins and Owners can view invitations"
  on event_invitations for select
  using (
    exists (select 1 from events where id = event_invitations.event_id and (user_id = auth.uid() OR is_event_admin(id)))
    OR
    (email = (select email from auth.users where id = auth.uid()))
  );

create policy "Admins and Owners can create invitations"
  on event_invitations for insert
  with check (
    exists (select 1 from events where id = event_invitations.event_id and (user_id = auth.uid() OR is_event_admin(id)))
  );

create policy "Admins and Owners can delete invitations"
  on event_invitations for delete
  using (
    exists (select 1 from events where id = event_invitations.event_id and (user_id = auth.uid() OR is_event_admin(id)))
    OR
    (email = (select email from auth.users where id = auth.uid()))
  );
