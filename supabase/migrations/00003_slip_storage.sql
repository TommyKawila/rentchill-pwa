-- Supabase Storage bucket for payment slips

insert into storage.buckets (id, name, public)
values ('slips', 'slips', true)
on conflict (id) do nothing;

create policy "public_read_slips"
on storage.objects for select
using (bucket_id = 'slips');

create policy "service_upload_slips"
on storage.objects for insert
with check (bucket_id = 'slips');
