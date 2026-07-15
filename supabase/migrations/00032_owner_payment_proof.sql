alter table invoices
  add column if not exists owner_payment_proof_url text,
  add column if not exists owner_payment_note text;
