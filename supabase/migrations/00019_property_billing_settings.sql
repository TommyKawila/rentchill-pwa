alter table properties
  add column if not exists billing_day int not null default 1
    check (billing_day >= 1 and billing_day <= 28),
  add column if not exists meter_reminder_days_before int not null default 3
    check (meter_reminder_days_before >= 1 and meter_reminder_days_before <= 7),
  add column if not exists include_utilities boolean not null default true;
