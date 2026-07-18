alter table tenants
  add column if not exists pdpa_policy_version text;

alter table owners
  add column if not exists pdpa_consented_at timestamptz;

alter table owners
  add column if not exists pdpa_policy_version text;
