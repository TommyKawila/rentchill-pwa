alter table properties
  add column if not exists share_token text unique,
  add column if not exists share_expires_at timestamptz;
