create table activities_translation (
  id uuid PRIMARY KEY default gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text
);

alter table activities_translation enable row level security;