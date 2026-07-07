alter table invoices
  add column if not exists slip_rejection_note text;
