alter table properties
  add column if not exists plan_tier text not null default 'starter'
    check (plan_tier in ('starter', 'micro', 'growth', 'pro')),
  add column if not exists quota_month text,
  add column if not exists reminder_used_this_month int not null default 0,
  add column if not exists csv_used_this_month int not null default 0;
