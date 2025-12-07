-- 1. Fix "Unknown Event" by allowing invitees to view the events they are invited to
create policy "Invitees can view events"
  on events for select
  using (
    exists (
      select 1 from event_invitations
      where event_invitations.event_id = events.id
      and lower(event_invitations.email) = lower(auth.jwt() ->> 'email')
    )
  );

-- 2. Fix "Can't accept" by using a secure function
-- This function runs with potential elevated privileges (security definer) to perform the admin insertion
create or replace function public.accept_event_invitation(invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_user_email text;
begin
  -- Get the current user's email securely
  v_user_email := auth.jwt() ->> 'email';

  -- Find the invitation
  select * into v_invite
  from event_invitations
  where id = invitation_id
  and status = 'pending';

  if v_invite is null then
    raise exception 'Invitation not found or not pending';
  end if;

  -- Verify the invitation belongs to the current user
  if lower(v_invite.email) <> lower(v_user_email) then
    raise exception 'This invitation does not belong to you.';
  end if;

  -- Insert into event_admins
  insert into event_admins (event_id, user_id, role)
  values (v_invite.event_id, auth.uid(), 'admin')
  on conflict (event_id, user_id) do nothing; -- idempotency

  -- Update invitation status
  update event_invitations
  set status = 'accepted'
  where id = invitation_id;

  return true;
end;
$$;
