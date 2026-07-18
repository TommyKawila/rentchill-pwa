alter table properties
  add column if not exists water_billing_mode text not null default 'flat'
    check (water_billing_mode in ('flat', 'meter')),
  add column if not exists water_flat_baht numeric(10, 2) not null default 0
    check (water_flat_baht >= 0);
