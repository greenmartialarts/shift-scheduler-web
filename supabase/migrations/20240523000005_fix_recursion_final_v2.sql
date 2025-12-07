-- FIX: RLS Recursion by using Security Definer functions for ALL cross-table checks
-- This prevents polices from triggering each other in a loop.

-- 1. Create is_event_owner function (Security Definer)
-- Checks if auth.uid() is the owner of the event without triggering events RLS
create or replace function public.is_event_owner(lookup_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from events
    where id = lookup_event_id
    and user_id = auth.uid()
  );
end;
$$;

-- 2. Ensure is_event_admin function (Security Definer) is correct
-- Checks if auth.uid() is an admin without triggering event_admins RLS
create or replace function public.is_event_admin(lookup_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from event_admins
    where event_id = lookup_event_id
    and user_id = auth.uid()
  );
end;
$$;


-- 3. Update EVENTS Policies
-- Use functions to avoid direct recursion if possible, though direct column checks (user_id = auth.uid()) are usually safe.
-- But using the function guarantees no weird side effects if we ever change RLS.
drop policy if exists "Admins and Owners can view events" on events;
drop policy if exists "Users can insert events" on events;
drop policy if exists "Admins and Owners can update events" on events;
drop policy if exists "Admins and Owners can delete events" on events;
drop policy if exists "Invitees can view events" on events;

create policy "Admins and Owners can view events"
  on events for select
  using (
    user_id = auth.uid() -- Fast local check
    OR is_event_admin(id) -- Secure remote check
    OR exists ( -- Join based check for invitations (can't easily use sec definer here without another func, but invites table shouldn't recurse back to events in a dangerous way)
        select 1 from event_invitations
        where event_invitations.event_id = events.id
        and lower(event_invitations.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Users can insert events"
  on events for insert
  with check (auth.uid() = user_id);

create policy "Admins and Owners can update events"
  on events for update
  using ( is_event_owner(id) OR is_event_admin(id) );

create policy "Admins and Owners can delete events"
  on events for delete
  using ( is_event_owner(id) OR is_event_admin(id) );


-- 4. Update EVENT_ADMINS Policies
-- CRITICAL : Use is_event_owner instead of joining events directly!
drop policy if exists "Users can view their own admin status" on event_admins;
drop policy if exists "Event Owners can view event admins" on event_admins;
drop policy if exists "Event Owners can insert event admins" on event_admins;
drop policy if exists "Event Owners can delete event admins" on event_admins;
drop policy if exists "Admins can remove themselves" on event_admins;

-- Select: View if I am the admin OR if I am the owner
create policy "Admins and Owners can view event admins"
  on event_admins for select
  using (
    user_id = auth.uid() -- I can see my own row
    OR is_event_owner(event_id) -- Owner can see all
    OR is_event_admin(event_id) -- Other admins can see all (optional, but good for UI)
  );

-- Insert: Only Owner or Admin can add admins
create policy "Admins and Owners can insert event admins"
  on event_admins for insert
  with check (
    is_event_owner(event_id)
    OR is_event_admin(event_id)
  ); 
  -- Note: When creating an event, the owner inserts themselves. 
  -- At that moment, is_event_owner(id) returns true (event exists).
  -- is_event_admin(id) returns false.
  -- This should work.

-- Delete: Owner or Admin can remove
create policy "Admins and Owners can delete event admins"
  on event_admins for delete
  using (
    user_id = auth.uid() -- I can assign/remove myself? Well, remove yes.
    OR is_event_owner(event_id)
    OR is_event_admin(event_id)
  );


-- 5. Helper Policies for Dependent Tables (Volunteers/Shifts/Assignments)
-- They can use the functions too for cleaner code
drop policy if exists "Admins and Owners can view volunteers" on volunteers;
create policy "Admins and Owners can view volunteers" on volunteers for select
  using ( is_event_owner(event_id) OR is_event_admin(event_id) );
-- (And similarly for other operations/tables if desired, but the main recursion was likely Events<->Admins)
