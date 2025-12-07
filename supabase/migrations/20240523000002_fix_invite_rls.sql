-- Fix RLS policy for viewing invitations
-- The previous policy tried to select from auth.users which might be restricted.
-- We should use auth.jwt() ->> 'email' to reliably get the current user's email.

drop policy if exists "Admins and Owners can view invitations" on event_invitations;

create policy "Admins and Owners can view invitations"
  on event_invitations for select
  using (
    -- Admin/Owner check
    exists (select 1 from events where id = event_invitations.event_id and (user_id = auth.uid() OR is_event_admin(id)))
    OR
    -- Invitee check (User can see their own invites)
    -- Using auth.jwt() is safer/faster than querying auth.users
    (lower(email) = lower(auth.jwt() ->> 'email'))
  );

-- Also update delete/update (decline/accept) policies just in case
drop policy if exists "Admins and Owners can delete invitations" on event_invitations;

create policy "Admins and Owners can delete invitations"
  on event_invitations for delete
  using (
    -- Admin/Owner check
    exists (select 1 from events where id = event_invitations.event_id and (user_id = auth.uid() OR is_event_admin(id)))
    OR
    -- Invitee check
    (lower(email) = lower(auth.jwt() ->> 'email'))
  );

-- Note: We might also need an update policy if we are updating status instead of deleting
drop policy if exists "Admins and Owners can update invitations" on event_invitations;

create policy "Admins and Owners can update invitations"
  on event_invitations for update
  using (
    exists (select 1 from events where id = event_invitations.event_id and (user_id = auth.uid() OR is_event_admin(id)))
    OR
    (lower(email) = lower(auth.jwt() ->> 'email'))
  );
