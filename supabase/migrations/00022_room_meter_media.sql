create table room_meter_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  billing_month text not null,
  utility_type text not null check (utility_type in ('water', 'electric')),
  storage_path text not null,
  public_url text not null,
  uploaded_by text not null check (uploaded_by in ('owner', 'tenant')),
  created_at timestamptz not null default now()
);

create index room_meter_media_room_month_idx on room_meter_media(room_id, billing_month);
create index room_meter_media_property_idx on room_meter_media(property_id);

alter table room_meter_media enable row level security;

create policy "public_read_room_meter_media"
on room_meter_media for select using (true);

create policy "service_insert_room_meter_media"
on room_meter_media for insert with check (true);

insert into storage.buckets (id, name, public)
values ('meters', 'meters', true)
on conflict (id) do nothing;

create policy "public_read_meters"
on storage.objects for select
using (bucket_id = 'meters');

create policy "service_upload_meters"
on storage.objects for insert
with check (bucket_id = 'meters');
