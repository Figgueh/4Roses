create table image_data (
  id uuid primary key default gen_random_uuid (),
  image_path text not null,
  display_order integer not null,
  alt text,
  title text
);

alter table image_data enable row level security;

create policy "Enable read access for all users" on "public"."image_data" as PERMISSIVE for
select
  to public using (true);

create policy "Allow admin write access"
on public.image_data
for all
using (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);