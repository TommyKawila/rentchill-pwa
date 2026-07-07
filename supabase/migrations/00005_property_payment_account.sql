alter table properties
  add column if not exists payment_prompt_pay text,
  add column if not exists payment_bank_account text,
  add column if not exists payment_receiver_name text;
