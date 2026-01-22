Tutorial Implementation Plan

Goal

Create a high-quality interactive onboarding tutorial that helps new users feel welcome and confident.

Triggers Automatically: Greets the user the very first time they sign in.

Persists: Remembers if a user has finished the tutorial so they don't see it every time they log in.

Replayable: Users can choose to watch the tutorial again from their Account Settings if they need a refresher.

Premium Feel: Uses smooth animations and "spotlight" effects to focus the user's attention on specific parts of the screen.

1. Database Updates

To keep track of who has seen the tutorial, we need to save a "completed" flag for each user profile in our database.

SQL Migration

-- New Table: profiles
-- This stores extra info about our users
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  has*completed*tutorial boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Secure the table so users can only see their own info
alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- This function automatically creates a profile when someone signs up
create function public.handle*new*user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on*auth*user_created
  after insert on auth.users
  for each row execute procedure public.handle*new*user();


2. Component Architecture

A. Tutorial Logic (State Machine)

We need a smart system to track where the user is in the tour, especially since the tour moves between different pages.

Tracking: Keep track of the current stepId and what action we are waiting for (like clicking a specific button).

Memory: Save the progress locally so if the user refreshes the page, the tutorial stays on the right step.

B. Tutorial Visuals (Overlay)

This is what the user actually sees on the screen:

Spotlight Effect: Dims the rest of the page and "shines a light" on the button or area the user needs to look at.

Instructions: Friendly cards that explain what to do next with a "Next" or "Skip" button.

3. Step-by-Step Configuration

Phase 1: Getting Started

Welcome: A friendly "Welcome to Shift Scheduler!" pop-up.

Creating a Hub: Showing the user how to create their first workspace.

Event Setup: Guiding them through filling out their first event form.

Phase 2: Managing Events

Dashboard: Explaining how to read the event overview.

The Team: Showing how to view and manage the volunteer list.

Adding People: Helping the user add their first helper to the system.

Phase 3: Scheduling and Logistics

Shifts: Teaching the user how to set up time slots for work.

Assignments: Showing how to match a person to a specific shift.

Assets: Tracking helpful tools like walkie-talkies or tablets.

Phase 4: Live Operations

Check-in: How to mark someone as "arrived" on the day of the event.

Check-out: How to finish the day and make sure everyone is signed out safely.

Phase 5: Wrapping Up

Cleanup: How to delete test data to keep the dashboard tidy.

Conclusion: A "You're a pro!" message to celebrate finishing the tour.

4. Integration Plan

File Structure

src/components/tutorial/TutorialContext.tsx: The "brain" of the tutorial.

src/components/tutorial/TutorialOverlay.tsx: The "look" of the tutorial.

How it Hooks In

Main Wrapper: We put the TutorialProvider around the whole app so it's always ready to help.

The Trigger: When a user lands on the dashboard, the app checks if they've finished the tour. If not, the tour starts automatically!

5. Execution Checklist

[x] Database Setup: Run the SQL code to create user profiles.

[x] Logic Core: Build the system that moves from step to step.

[x] Visuals: Create the animated spotlight and instruction cards.

[x] Final Polish: Test the tour to make sure it's helpful and fun to use.