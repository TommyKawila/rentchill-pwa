alter table invoices
  add column if not exists extra_items jsonb not null default '[]'::jsonb,
  add column if not exists include_promptpay_qr boolean not null default true;
