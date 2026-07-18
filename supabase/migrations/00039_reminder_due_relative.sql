-- Reminder tiers: soft = days before due; firm/final = days overdue

alter table properties
  alter column reminder_soft_days set default 1,
  alter column reminder_firm_days set default 3,
  alter column reminder_final_days set default 7;

alter table properties
  drop constraint if exists properties_reminder_days_order_chk;

alter table properties
  add constraint properties_reminder_days_order_chk
  check (
    reminder_soft_days between 1 and 28
    and reminder_firm_days between 1 and 28
    and reminder_final_days between 1 and 28
    and reminder_firm_days < reminder_final_days
  );
