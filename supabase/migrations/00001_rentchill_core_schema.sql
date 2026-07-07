-- RentChill core schema (matches src/services/types.ts)

create extension if not exists "pgcrypto";

create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  room_number text not null,
  base_rent_price numeric(10, 2) not null check (base_rent_price >= 0),
  status text not null check (status in ('available', 'occupied', 'maintenance')),
  unique (property_id, room_number)
);

create table tenants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete restrict,
  line_user_id text,
  phone_number text not null,
  name text not null,
  move_in_date date not null
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  billing_month text not null check (billing_month ~ '^\d{4}-\d{2}$'),
  water_unit numeric(10, 2) not null default 0,
  electric_unit numeric(10, 2) not null default 0,
  base_rent_amount numeric(10, 2) not null,
  water_amount numeric(10, 2) not null default 0,
  electric_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null,
  status text not null check (status in ('pending', 'scanning', 'paid')),
  slip_image_url text,
  unique (tenant_id, billing_month)
);

create index rooms_property_id_idx on rooms(property_id);
create index rooms_status_idx on rooms(status);
create index tenants_room_id_idx on tenants(room_id);
create index tenants_line_user_id_idx on tenants(line_user_id);
create index invoices_tenant_id_idx on invoices(tenant_id);
create index invoices_property_id_idx on invoices(property_id);

alter table properties enable row level security;
alter table rooms enable row level security;
alter table tenants enable row level security;
alter table invoices enable row level security;

-- TODO(RLS): scope by property_id + authenticated LINE user once LIFF auth lands
create policy "public_read_properties" on properties for select using (true);
create policy "public_read_rooms" on rooms for select using (true);
create policy "public_read_tenants" on tenants for select using (true);
create policy "public_read_invoices" on invoices for select using (true);
create policy "public_insert_invoices" on invoices for insert with check (true);

-- Demo seed for local integration testing
insert into properties (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Demo Apartment', 'demo-apartment');

insert into rooms (id, property_id, room_number, base_rent_price, status) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '101', 4500, 'occupied'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '102', 4800, 'available');

insert into tenants (id, room_id, line_user_id, phone_number, name, move_in_date)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  null,
  '0812345678',
  'คุณสมชาย',
  '2025-01-01'
);

insert into invoices (
  id, property_id, tenant_id, room_id, billing_month,
  water_unit, electric_unit, base_rent_amount, water_amount, electric_amount, total_amount, status
) values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  to_char(now(), 'YYYY-MM'),
  12, 85, 4500, 120, 595, 5215, 'pending'
);
