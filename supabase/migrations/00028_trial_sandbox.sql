alter table owners
  add column if not exists trial_reset_at timestamptz;

insert into owners (
  id,
  email,
  password_hash,
  name,
  plan_tier,
  status,
  is_superadmin,
  trial_reset_at
)
values (
  '00000000-0000-0000-0000-000000000020',
  'trial@rentchill.local',
  'trial-salt-fixed:522f626d48c246d1ffa7ea77de287273a4c912ff8e9ae60a6dd061aa3222a4b1a94bcd46d772ee04c6e85fb61298d0c6d34e9117c927d13c38b7613994b95d07',
  'Trial Sandbox',
  'growth',
  'active',
  false,
  now()
)
on conflict (email) do update
set
  name = excluded.name,
  plan_tier = excluded.plan_tier,
  status = excluded.status,
  is_superadmin = false;

insert into properties (id, name, slug, owner_id, plan_tier)
values (
  '00000000-0000-0000-0000-000000000022',
  'Trial Apartment',
  'trial-apartment',
  '00000000-0000-0000-0000-000000000020',
  'growth'
)
on conflict (slug) do update
set
  owner_id = excluded.owner_id,
  name = excluded.name,
  plan_tier = excluded.plan_tier;

update properties
set
  payment_receiver_name = 'CHINNAREE RATCHARIT',
  payment_bank_account = null,
  payment_prompt_pay = null
where slug = 'trial-apartment';
