alter table properties
  add column if not exists reminder_template_soft text,
  add column if not exists reminder_template_firm text,
  add column if not exists reminder_template_final text;
