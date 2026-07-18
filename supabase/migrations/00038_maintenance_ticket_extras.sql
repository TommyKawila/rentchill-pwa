alter table maintenance_tickets
  drop constraint if exists maintenance_tickets_category_check;

alter table maintenance_tickets
  add constraint maintenance_tickets_category_check
  check (category in ('ac', 'plumbing', 'electrical', 'furniture', 'other'));

alter table maintenance_tickets
  add column if not exists technician_name text,
  add column if not exists technician_phone text,
  add column if not exists expense_amount numeric,
  add column if not exists video_url text;
