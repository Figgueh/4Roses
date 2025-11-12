-- drop table activities cascade;
create table activities (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  image text not null,
  create_at timestamptz default now()
);

alter table activities enable row level security;

create policy "Enable read access for all users" on "public"."activities" as PERMISSIVE for
select
  to public using (true);

-- SELECT
CREATE POLICY "Admins or service can select activities"
ON activities
FOR SELECT
USING (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- INSERT
CREATE POLICY "Admins or service can insert activities"
ON activities
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- UPDATE
CREATE POLICY "Admins or service can update activities"
ON activities
FOR UPDATE
USING (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
)
WITH CHECK (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- DELETE
CREATE POLICY "Admins or service can delete activities"
ON activities
FOR DELETE
USING (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);