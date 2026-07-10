create table tenant_deposits (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  amount numeric(10, 2) not null default 0 check (amount >= 0),
  status text not null default 'held' check (status in ('held', 'refunded', 'partial_refund', 'forfeited')),
  note text,
  updated_at timestamptz not null default now()
);

create index tenant_deposits_property_idx on tenant_deposits(property_id);

alter table tenant_deposits enable row level security;

create policy "public_read_tenant_deposits"
on tenant_deposits for select using (true);

create policy "service_upsert_tenant_deposits"
on tenant_deposits for insert with check (true);

create policy "service_update_tenant_deposits"
on tenant_deposits for update using (true);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  actor_type text not null check (actor_type in ('owner', 'tenant', 'system')),
  actor_id text,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_property_created_idx on audit_log(property_id, created_at desc);

alter table audit_log enable row level security;

create policy "public_read_audit_log"
on audit_log for select using (true);

create policy "service_insert_audit_log"
on audit_log for insert with check (true);
