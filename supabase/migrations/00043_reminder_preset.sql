-- Reminder timing presets (UX metadata; day columns remain cron source of truth)

alter table properties
  add column if not exists reminder_preset text not null default 'balanced';

alter table properties
  drop constraint if exists properties_reminder_preset_chk;

alter table properties
  add constraint properties_reminder_preset_chk
  check (
    reminder_preset in ('balanced', 'early', 'gentle', 'assertive', 'custom')
  );

-- Backfill from existing day triples
update properties
set reminder_preset = case
  when reminder_soft_days = 1 and reminder_firm_days = 3 and reminder_final_days = 7
    then 'balanced'
  when reminder_soft_days = 3 and reminder_firm_days = 3 and reminder_final_days = 7
    then 'early'
  when reminder_soft_days = 3 and reminder_firm_days = 5 and reminder_final_days = 10
    then 'gentle'
  when reminder_soft_days = 1 and reminder_firm_days = 1 and reminder_final_days = 5
    then 'assertive'
  else 'custom'
end;
