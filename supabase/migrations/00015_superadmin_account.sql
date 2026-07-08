alter table owners
  add column if not exists is_superadmin boolean not null default false;

-- Platform-only superadmin (no properties attached)
insert into owners (id, email, password_hash, name, plan_tier, status, is_superadmin)
values (
  '00000000-0000-0000-0000-000000000011',
  'admin@rentchill.local',
  '3245de446022982e45fc037f41ff7894:cdc97fc1292a0b1e858a254c42b10e81496840619d556274963be2f0765345b23093b44d975782afd3be2644eacbb01eda7d9e76de315113e559c6c358c57ea3',
  'RentChill Platform',
  'pro',
  'active',
  true
)
on conflict (email) do update
set is_superadmin = true,
    name = excluded.name;
