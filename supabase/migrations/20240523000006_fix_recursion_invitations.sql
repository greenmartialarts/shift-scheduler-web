-- FIX: Break RLS recursion between Events and Invitations
-- The 'events' table checks 'event_invitations', and 'event_invitations' was checking 'events'.
-- We replace the direct 'events' check in 'event_invitations' with the security definer function 'is_event_owner',
-- which bypasses RLS on 'events' and breaks the loop.

drop policy if exists "Admins and Owners can view invitations" on event_invitations;
drop policy if exists "Admins and Owners can create invitations" on event_invitations;
drop policy if exists "Admins and Owners can delete invitations" on event_invitations;
drop policy if exists "Admins and Owners can update invitations" on event_invitations;

create policy "Admins and Owners can view invitations"
  on event_invitations for select
  using (
    is_event_owner(event_id)
    OR is_event_admin(event_id)
    OR (lower(email) = lower(auth.jwt() ->> 'email'))
  );

create policy "Admins and Owners can create invitations"
  on event_invitations for insert
  with check (
    is_event_owner(event_id)
    OR is_event_admin(event_id)
  );

create policy "Admins and Owners can delete invitations"
  on event_invitations for delete
  using (
    is_event_owner(event_id)
    OR is_event_admin(event_id)
    OR (lower(email) = lower(auth.jwt() ->> 'email'))
  );

create policy "Admins and Owners can update invitations"
  on event_invitations for update
  using (
    is_event_owner(event_id)
    OR is_event_admin(event_id)
    OR (lower(email) = lower(auth.jwt() ->> 'email'))
  );
