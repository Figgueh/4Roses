drop table users;

create table users (
  id uuid primary key default gen_random_uuid (),
  full_name text,
  email text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table users enable row level security;

create policy "Enable read access for all users" on "public"."users" as PERMISSIVE for
select
  to public using (true);

CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);