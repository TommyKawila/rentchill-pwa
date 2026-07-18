alter table properties
  add column if not exists currency text not null default 'THB',
  add column if not exists asset_value numeric;

comment on column properties.currency is 'ISO 4217 code for tenant billing display (THB, USD, …)';
comment on column properties.asset_value is 'Optional property value for rental yield % on dashboard bento';
