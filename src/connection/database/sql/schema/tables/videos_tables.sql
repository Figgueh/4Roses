create table public.videos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  url varchar not null,
  display_order smallint,
  is_display boolean default false
);