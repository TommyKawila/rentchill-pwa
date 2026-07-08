create table owners (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

alter table owners enable row level security;

alter table properties
  add column if not exists owner_id uuid references owners(id) on delete set null;

create index if not exists properties_owner_id_idx on properties(owner_id);

-- Demo owner: owner@demo.local / demo-rentchill
insert into owners (id, email, password_hash, name)
values (
  '00000000-0000-0000-0000-000000000010',
  'owner@demo.local',
  'rentchill-demo-owner:12e318d304c0462499866e023a0709cc648710f1bf6de21d05be073c3bd1feb95ed2adca772795330d0413be94d11fc949ebd77e8edc67c6925a29881c8f1199',
  'Demo Owner'
)
on conflict (email) do nothing;

update properties
set owner_id = '00000000-0000-0000-0000-000000000010'
where slug = 'demo-apartment' and owner_id is null;
