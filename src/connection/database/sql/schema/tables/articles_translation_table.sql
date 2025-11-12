create table articles_translation (
  id uuid PRIMARY KEY default gen_random_uuid(),
  articles_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text,
  description text,
  content jsonb
);

alter table articles_translation enable row level security;