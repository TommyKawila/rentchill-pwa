alter table properties
  add column if not exists payment_bank_accounts jsonb not null default '[]'::jsonb,
  add column if not exists active_payment_bank_account_id text;

with seeded as (
  select
    id,
    gen_random_uuid()::text as acct_id,
    payment_bank_account,
    payment_receiver_name
  from properties
  where coalesce(trim(payment_bank_account), '') <> ''
    and jsonb_array_length(payment_bank_accounts) = 0
)
update properties p
set
  payment_bank_accounts = jsonb_build_array(
    jsonb_build_object(
      'id', s.acct_id,
      'bank_account', s.payment_bank_account,
      'receiver_name', coalesce(s.payment_receiver_name, '')
    )
  ),
  active_payment_bank_account_id = s.acct_id
from seeded s
where p.id = s.id;
