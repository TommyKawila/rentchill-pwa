alter table properties
  add column if not exists contact_line_qr_url text;

insert into storage.buckets (id, name, public)
values ('property-assets', 'property-assets', true)
on conflict (id) do nothing;

create policy "public_read_property_assets"
on storage.objects for select
using (bucket_id = 'property-assets');

create policy "service_upload_property_assets"
on storage.objects for insert
with check (bucket_id = 'property-assets');
