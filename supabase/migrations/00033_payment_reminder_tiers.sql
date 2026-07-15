-- Payment reminder tiers: soft / firm / final days after bill issue

alter table properties
  add column if not exists reminder_soft_days int not null default 3,
  add column if not exists reminder_firm_days int not null default 7,
  add column if not exists reminder_final_days int not null default 10;

alter table properties
  drop constraint if exists properties_reminder_days_order_chk;

alter table properties
  add constraint properties_reminder_days_order_chk
  check (
    reminder_soft_days between 1 and 28
    and reminder_firm_days between 1 and 28
    and reminder_final_days between 1 and 28
    and reminder_soft_days < reminder_firm_days
    and reminder_firm_days < reminder_final_days
  );

alter table invoices
  add column if not exists issued_at timestamptz,
  add column if not exists reminder_tier_sent text
    check (reminder_tier_sent is null or reminder_tier_sent in ('soft', 'firm', 'final')),
  add column if not exists reminder_sent_at timestamptz;

update invoices
set issued_at = coalesce(issued_at, now())
where status in ('pending', 'scanning')
  and issued_at is null;
