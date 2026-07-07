alter table tenants
add column if not exists pdpa_consented_at timestamptz;
