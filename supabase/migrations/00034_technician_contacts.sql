alter table properties
  add column if not exists technician_contacts jsonb not null default '{}';

update properties
set technician_contacts = jsonb_build_object(
  'plumbing',
  jsonb_build_object('phone', technician_phone, 'line_url', null)
)
where technician_phone is not null
  and trim(technician_phone) <> ''
  and technician_contacts = '{}'::jsonb;
