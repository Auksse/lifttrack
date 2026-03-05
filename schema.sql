-- LiftTrack — Supabase schema
-- Run this in the Supabase SQL editor to set up your database.

create table if not exists sessions (
  id        uuid primary key default gen_random_uuid(),
  date      text not null,       -- 'YYYY-MM-DD'
  focus     text not null,       -- e.g. 'Push', 'Pull', 'Legs'
  exercises jsonb not null default '[]'::jsonb
  -- exercises structure:
  -- [{ name: string, sets: [{ r: number, w: number }], ss?: boolean }]
);

-- Index for the default sort order used by the app
create index if not exists sessions_date_idx on sessions (date asc);

-- Row Level Security
-- The app uses only the anon key with no user auth,
-- so we open up all operations for the anon role.
alter table sessions enable row level security;

create policy "anon full access"
  on sessions
  for all
  to anon
  using (true)
  with check (true);
