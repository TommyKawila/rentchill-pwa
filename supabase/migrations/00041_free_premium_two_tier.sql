-- Collapse 4 tiers → free | premium

update owners set plan_tier = 'premium' where plan_tier in ('micro', 'growth', 'pro');
update owners set plan_tier = 'free' where plan_tier = 'starter';

update properties set plan_tier = 'premium' where plan_tier in ('micro', 'growth', 'pro');
update properties set plan_tier = 'free' where plan_tier = 'starter';

update platform_payments set plan_requested = 'premium' where plan_requested in ('micro', 'growth', 'pro');

alter table owners drop constraint if exists owners_plan_tier_check;
alter table owners add constraint owners_plan_tier_check
  check (plan_tier in ('free', 'premium'));

alter table properties drop constraint if exists properties_plan_tier_check;
alter table properties add constraint properties_plan_tier_check
  check (plan_tier in ('free', 'premium'));

alter table platform_payments drop constraint if exists platform_payments_plan_requested_check;
alter table platform_payments add constraint platform_payments_plan_requested_check
  check (plan_requested in ('premium'));

alter table owners alter column plan_tier set default 'free';
alter table properties alter column plan_tier set default 'free';
