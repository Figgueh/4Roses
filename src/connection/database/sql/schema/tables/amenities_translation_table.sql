create table amenities_translation (
  id uuid PRIMARY KEY default gen_random_uuid(),
  amenities_id uuid REFERENCES amenities(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text,
  description text
);

alter table amenities_translation enable row level security;

create policy "Enable read access for all users" on "public"."amenities_translation" as PERMISSIVE for
select
  to public using (true);

-- Allow admin inserts
create policy "Allow admin insert"
on public.amenities_translation
for insert
with check (
  auth.role() = 'authenticated'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.is_admin = true
  )
);

-- Allow admin updates
create policy "Allow admin update"
on public.amenities_translation
for update
using (
  auth.role() = 'authenticated'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.is_admin = true
  )
)
with check (
  auth.role() = 'authenticated'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.is_admin = true
  )
);

-- Allow admin delete
create policy "Allow admin delete"
on public.amenities_translation
for delete
using (
  auth.role() = 'authenticated'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.is_admin = true
  )
);

