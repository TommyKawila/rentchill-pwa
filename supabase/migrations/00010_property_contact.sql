alter table properties
  add column if not exists contact_line_url text,
  add column if not exists contact_phone text,
  add column if not exists owner_line_user_id text;
