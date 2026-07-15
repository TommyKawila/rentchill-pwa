create table maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  category text not null check (category in ('ac', 'plumbing', 'electrical', 'other')),
  description text not null check (char_length(trim(description)) >= 3),
  photo_url text,
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index maintenance_tickets_property_id_idx on maintenance_tickets(property_id);
create index maintenance_tickets_status_idx on maintenance_tickets(status);
create index maintenance_tickets_created_at_idx on maintenance_tickets(created_at desc);

alter table maintenance_tickets enable row level security;

create policy "public_read_maintenance_tickets"
on maintenance_tickets for select using (true);

create policy "public_insert_maintenance_tickets"
on maintenance_tickets for insert with check (true);

create policy "public_update_maintenance_tickets"
on maintenance_tickets for update using (true);

insert into storage.buckets (id, name, public)
values ('maintenance', 'maintenance', true)
on conflict (id) do nothing;

create policy "public_read_maintenance_photos"
on storage.objects for select
using (bucket_id = 'maintenance');

create policy "service_upload_maintenance_photos"
on storage.objects for insert
with check (bucket_id = 'maintenance');
