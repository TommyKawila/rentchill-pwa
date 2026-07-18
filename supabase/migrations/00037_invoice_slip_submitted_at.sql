alter table invoices
  add column if not exists slip_submitted_at timestamptz;
