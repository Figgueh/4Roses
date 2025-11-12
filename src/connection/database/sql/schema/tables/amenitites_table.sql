-- drop table amenities;

create table amenities (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  description text not null,
  image text not null,
  small boolean not null,
  create_at timestamptz default now()
);

alter table amenities enable row level security;

create policy "Enable read access for all users" on "public"."amenities" as PERMISSIVE for
select
  to public using (true);