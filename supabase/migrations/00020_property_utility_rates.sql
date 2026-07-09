alter table properties
  add column if not exists water_rate_per_unit numeric(10, 2) not null default 10
    check (water_rate_per_unit >= 0),
  add column if not exists electric_rate_per_unit numeric(10, 2) not null default 7
    check (electric_rate_per_unit >= 0);
