alter table properties
  add column if not exists marketing_description text,
  add column if not exists marketing_address text,
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb;
