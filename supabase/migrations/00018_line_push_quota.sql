alter table properties
  add column if not exists line_push_used_this_month int not null default 0;

create table if not exists line_push_log (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  owner_id uuid references owners(id) on delete set null,
  message_type text not null,
  line_user_id text not null,
  charged boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists line_push_log_created_at_idx on line_push_log(created_at);
create index if not exists line_push_log_property_id_idx on line_push_log(property_id);
