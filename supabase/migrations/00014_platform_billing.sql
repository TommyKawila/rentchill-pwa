alter table owners
  add column if not exists plan_tier text not null default 'starter'
    check (plan_tier in ('starter', 'micro', 'growth', 'pro')),
  add column if not exists status text not null default 'active'
    check (status in ('active', 'expired')),
  add column if not exists expires_at timestamptz;

create table if not exists platform_payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  plan_requested text not null
    check (plan_requested in ('micro', 'growth', 'pro')),
  slip_url text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists platform_payments_status_idx on platform_payments(status);
create index if not exists platform_payments_owner_id_idx on platform_payments(owner_id);

alter table platform_payments enable row level security;

create or replace function approve_platform_payment(payment_id uuid)
returns void
language plpgsql
as $$
declare
  payment_row platform_payments%rowtype;
  new_expires timestamptz;
begin
  select *
  into payment_row
  from platform_payments
  where id = payment_id and status = 'pending'
  for update;

  if not found then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  select coalesce(
    case when expires_at > now() then expires_at else now() end,
    now()
  ) + interval '30 days'
  into new_expires
  from owners
  where id = payment_row.owner_id;

  update platform_payments
  set status = 'approved'
  where id = payment_id;

  update owners
  set
    plan_tier = payment_row.plan_requested,
    status = 'active',
    expires_at = new_expires
  where id = payment_row.owner_id;

  update properties
  set plan_tier = payment_row.plan_requested
  where owner_id = payment_row.owner_id;
end;
$$;
