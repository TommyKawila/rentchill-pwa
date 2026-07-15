create table owner_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (owner_id, endpoint)
);

create index owner_push_subscriptions_owner_id_idx on owner_push_subscriptions(owner_id);

alter table owner_push_subscriptions enable row level security;

create policy "public_read_owner_push_subscriptions"
on owner_push_subscriptions for select using (true);

create policy "public_insert_owner_push_subscriptions"
on owner_push_subscriptions for insert with check (true);

create policy "public_delete_owner_push_subscriptions"
on owner_push_subscriptions for delete using (true);
