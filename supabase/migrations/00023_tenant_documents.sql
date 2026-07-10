create table tenant_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  doc_type text not null,
  label text,
  storage_path text not null,
  public_url text not null,
  mime_type text not null default 'image/jpeg',
  uploaded_by text not null check (uploaded_by in ('owner', 'tenant')),
  created_at timestamptz not null default now()
);

create index tenant_documents_tenant_idx on tenant_documents(tenant_id);
create index tenant_documents_room_idx on tenant_documents(room_id);

alter table tenant_documents enable row level security;

create policy "public_read_tenant_documents"
on tenant_documents for select using (true);

create policy "service_insert_tenant_documents"
on tenant_documents for insert with check (true);

create policy "service_delete_tenant_documents"
on tenant_documents for delete using (true);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "public_read_documents"
on storage.objects for select
using (bucket_id = 'documents');

create policy "service_upload_documents"
on storage.objects for insert
with check (bucket_id = 'documents');

create policy "service_delete_documents"
on storage.objects for delete
using (bucket_id = 'documents');
