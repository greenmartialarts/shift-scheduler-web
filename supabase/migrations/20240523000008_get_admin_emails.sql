-- FIX: Return email addresses for event admins
-- We need a secure function to fetch user emails from auth.users (which is restricted)
-- joined with event_admins.

create or replace function public.get_event_admins_details(lookup_event_id uuid)
returns table (
  user_id uuid,
  role text,
  created_at timestamptz,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if the current user is allowed to see the admins (Owner or Admin)
  if not (
    exists (select 1 from event_admins where event_id = lookup_event_id and event_admins.user_id = auth.uid())
    OR
    exists (select 1 from events where id = lookup_event_id and events.user_id = auth.uid())
  ) then
     return; -- Return empty if not authorized
  end if;

  return query
  select 
    ea.user_id,
    ea.role,
    ea.created_at,
    au.email::text -- Cast to text to ensure compatibility
  from event_admins ea
  join auth.users au on au.id = ea.user_id
  where ea.event_id = lookup_event_id;
end;
$$;
