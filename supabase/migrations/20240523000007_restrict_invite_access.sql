-- RESTRICT ACCESS: Invitees should NOT be able to access the event page directly.
-- They should only see the event name in the dashboard list.

-- 1. Revert the Events RLS policy to STRICTLY Admins and Owners
drop policy if exists "Admins and Owners can view events" on events;
create policy "Admins and Owners can view events"
  on events for select
  using (
    user_id = auth.uid() 
    OR 
    is_event_admin(id)
    -- REMOVED the check for event_invitations
  );

-- 2. Create a Security Definer function to fetch invitations WITH event names
-- This allows us to show the event name on the dashboard without giving read access to the event row itself.
create or replace function public.get_my_pending_invitations()
returns table (
  id uuid,
  event_id uuid,
  email text,
  status text,
  created_at timestamptz,
  expires_at timestamptz,
  token uuid,
  event_name text -- Joined column
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    i.id,
    i.event_id,
    i.email,
    i.status,
    i.created_at,
    i.expires_at,
    i.token,
    e.name as event_name
  from event_invitations i
  join events e on e.id = i.event_id
  where lower(i.email) = lower(auth.jwt() ->> 'email')
  and i.status = 'pending';
end;
$$;
