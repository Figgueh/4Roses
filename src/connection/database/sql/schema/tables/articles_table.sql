-- drop table articles;

create table articles (
  id uuid primary key default gen_random_uuid (),
  activity_id uuid references activities (id) not null,
  title text not null unique,
  description text not null,
  content jsonb not null,
  image text not null,
  url text not null,
  created_at timestamptz default now()
);

alter table articles enable row level security;

create policy "Enable read access for all users" on "public"."articles" as PERMISSIVE for
select
  to public using (true);
  
-- SELECT
CREATE POLICY "Admins or service can select articles"
ON articles
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
CREATE POLICY "Admins or service can insert articles"
ON articles
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
CREATE POLICY "Admins or service can update articles"
ON articles
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
CREATE POLICY "Admins or service can delete articles"
ON articles
FOR DELETE
USING (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);
