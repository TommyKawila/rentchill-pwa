create table meter_readings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  kind text not null check (kind in ('water', 'electric')),
  reading_value numeric(12, 2) not null check (reading_value >= 0),
  recorded_at timestamptz not null default now(),
  source text not null check (source in ('move_in', 'billing', 'override')),
  billing_month text check (billing_month is null or billing_month ~ '^\d{4}-\d{2}$'),
  invoice_id uuid references invoices(id) on delete set null,
  photo_media_id uuid references room_meter_media(id) on delete set null,
  created_at timestamptz not null default now()
);

create index meter_readings_room_kind_idx on meter_readings(room_id, kind, recorded_at desc);
create index meter_readings_billing_month_idx on meter_readings(room_id, billing_month);
create unique index meter_readings_room_month_kind_billing
  on meter_readings(room_id, billing_month, kind)
  where billing_month is not null and source = 'billing';

alter table meter_readings enable row level security;

create policy "public_read_meter_readings"
on meter_readings for select using (true);

create policy "service_insert_meter_readings"
on meter_readings for insert with check (true);

create policy "service_update_meter_readings"
on meter_readings for update using (true);

alter table invoices
  add column if not exists water_prev numeric(12, 2),
  add column if not exists water_curr numeric(12, 2),
  add column if not exists water_recorded_at timestamptz,
  add column if not exists electric_prev numeric(12, 2),
  add column if not exists electric_curr numeric(12, 2),
  add column if not exists electric_recorded_at timestamptz,
  add column if not exists water_rate_locked numeric(10, 2),
  add column if not exists electric_rate_locked numeric(10, 2);
