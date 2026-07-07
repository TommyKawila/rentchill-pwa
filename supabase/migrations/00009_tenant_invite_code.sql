alter table tenants
add column if not exists invite_code text;

create unique index if not exists tenants_invite_code_uidx on tenants (invite_code);

update tenants
set invite_code = 'RC' || upper(substr(md5(id::text), 1, 6))
where invite_code is null;

update tenants
set invite_code = 'RCDEMO1'
where id = '00000000-0000-0000-0000-000000000201';
