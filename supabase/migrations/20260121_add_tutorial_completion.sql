-- Create profiles table to store extra user data
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  has_completed_tutorial boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Secure the table
alter table public.profiles enable row level security;

-- Policies
do $$
begin
    if not exists (
        select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can view own profile'
    ) then
        create policy "Users can view own profile" on public.profiles
          for select using (auth.uid() = id);
    end if;

    if not exists (
        select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile'
    ) then
        create policy "Users can update own profile" on public.profiles
          for update using (auth.uid() = id);
    end if;
end $$;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
do $$
begin
    if not exists (
        select 1 from pg_trigger where tgname = 'on_auth_user_created'
    ) then
        create trigger on_auth_user_created
          after insert on auth.users
          for each row execute procedure public.handle_new_user();
    end if;
end $$;
