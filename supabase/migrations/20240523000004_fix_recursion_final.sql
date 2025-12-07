-- EMERGENCY FIX: Break recursion loop in RLS
-- The previous policies caused infinite recursion because event_admins RLS checked is_event_admin,
-- and is_event_admin checked event_admins. Even with specific implementation, it's fragile.

-- 1. Drop existing policies on event_admins that use the function
drop policy if exists "Admins and Owners can view event admins" on event_admins;
drop policy if exists "Admins and Owners can insert event admins" on event_admins;
drop policy if exists "Admins and Owners can delete event admins" on event_admins;

-- 2. Create simplified, non-recursive policies for event_admins
-- A. Users can view their OWN admin record
-- B. Event Owners can view ALL admin records for their events
-- (Temporarily removing "Admins can view other Admins" to restore stability)

create policy "Users can view their own admin status"
  on event_admins for select
  using (user_id = auth.uid());

create policy "Event Owners can view event admins"
  on event_admins for select
  using (
    exists (select 1 from events where id = event_admins.event_id and user_id = auth.uid())
  );

-- For insert/delete, primarily done via Server Actions which use Security Definer functions now.
-- But for direct checks (if any):
create policy "Event Owners can insert event admins"
  on event_admins for insert
  with check (
     exists (select 1 from events where id = event_admins.event_id and user_id = auth.uid())
  );

create policy "Event Owners can delete event admins"
  on event_admins for delete
  using (
     exists (select 1 from events where id = event_admins.event_id and user_id = auth.uid())
  );
  
-- Also allow self-removal (leaving an event)
create policy "Admins can remove themselves"
  on event_admins for delete
  using (user_id = auth.uid());

-- 2. Ensure is_event_admin function is solid
-- We keep this function for use in EVENTS table policies
create or replace function public.is_event_admin(lookup_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Simple check: Am I in the admins table?
  return exists (
    select 1 from event_admins
    where event_id = lookup_event_id
    and user_id = auth.uid()
  );
end;
$$;

-- 3. Just to be safe, update Events policy to prioritize Owner check (short-circuit optimization attempt)
drop policy if exists "Admins and Owners can view events" on events;
create policy "Admins and Owners can view events"
  on events for select
  using (
    -- Owner Key Check (Direct)
    user_id = auth.uid() 
    OR 
    -- Admin Check (Function)
    is_event_admin(id)
  );
