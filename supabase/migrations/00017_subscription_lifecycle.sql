alter table owners
  add column if not exists last_grace_notify_at date;
