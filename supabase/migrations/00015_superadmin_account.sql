alter table owners
  add column if not exists is_superadmin boolean not null default false;

-- Platform-only superadmin (no properties attached)
insert into owners (id, email, password_hash, name, plan_tier, status, is_superadmin)
values (
  '00000000-0000-0000-0000-000000000011',
  'admin@rentchill.local',
  'cad359cf35bb5676dde343294f5df503:f60570aefb72160c5f8a5d155831bf8542873eaaf80095457496b554a877f056cb13931258994959c3b730a236fc2b761b01cfbd1fbf302f2bce89c8e0399f11',
  'RentChill Platform',
  'pro',
  'active',
  true
)
on conflict (email) do update
set
  is_superadmin = true,
  name = excluded.name,
  password_hash = excluded.password_hash;
