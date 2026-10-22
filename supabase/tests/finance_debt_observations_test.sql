-- FAI-M04: synthetic debt terms, provenance, append-only snapshots, RLS.
begin;
select plan(40);
select has_table('public','finance_debts','debts table is present');

select has_table('public','finance_debt_observations','snapshot table exists');

select has_view('public','finance_debt_latest','latest snapshot view exists');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='public.finance_debts'::regclass),'debt owner RLS forced');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='public.finance_debt_observations'::regclass),'snapshot owner RLS forced');

select ok(not has_table_privilege('authenticated','public.finance_debts','INSERT') and not has_table_privilege('authenticated','public.finance_debts','UPDATE'),'no direct debt mutation grants');

select ok(not has_table_privilege('authenticated','public.finance_debt_observations','INSERT') and not has_table_privilege('authenticated','public.finance_debt_observations','UPDATE') and not has_table_privilege('authenticated','public.finance_debt_observations','DELETE'),'snapshots append-only to client');

select ok(not has_table_privilege('anon','public.finance_debt_latest','SELECT'),'anonymous latest debt read forbidden');

insert into auth.users(id) values ('a4000000-0000-4000-8000-0000000000a4'),('a5000000-0000-4000-8000-0000000000a5');
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-0000000000a4',true);

select throws_ok($$select public.finance_create_debt('b4000000-0000-4000-8000-0000000000b4','Synthetic debt')$$,'42501','Not an authorized finance owner','unprovisioned wallet cannot create debt');

reset role;
insert into finance_private.authorized_owners(owner_id) values ('a4000000-0000-4000-8000-0000000000a4');
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-0000000000a4',true);
insert into public.finance_spaces(id,owner_id,space_type,display_name)
values('b4000000-0000-4000-8000-0000000000b4','a4000000-0000-4000-8000-0000000000a4','personal','Synthetic personal'),
('b5000000-0000-4000-8000-0000000000b5','a4000000-0000-4000-8000-0000000000a4','store','Synthetic store');

select throws_ok($$select public.finance_create_debt('11111111-1111-4111-8111-111111111111','Foreign space')$$,'42501','Debt space unavailable','unknown space rejected');

select ok(public.finance_create_debt('b4000000-0000-4000-8000-0000000000b4','Synthetic Creditor') is not null,'create debt in own space');

select set_config('finance_ai.m04_debt',(select id::text from public.finance_debts
 where creditor='Synthetic Creditor'),true);

select is((select count(*)::integer from public.finance_debt_latest),1,'latest view includes debt with no observations');

select is((select has_missing_cost_data from public.finance_debt_latest),true,'missing snapshot explicitly incomplete');

select throws_ok($$select public.finance_record_debt_observation(
 current_setting('finance_ai.m04_debt')::uuid,'',current_date)$$,
 '22023','Invalid debt observation or missing rate provenance','unknown source not silently accepted');

select throws_ok($$select public.finance_record_debt_observation(
 current_setting('finance_ai.m04_debt')::uuid,'Synthetic source',current_date+1)$$,
 '22023','Invalid debt observation or missing rate provenance','no future source date');

select throws_ok($$select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Synthetic terms',
 p_as_of_date=>current_date,p_interest_percent=>2.5)$$,
 '22023','Invalid debt observation or missing rate provenance','rate must include unit and source');

select throws_ok($$select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Synthetic terms',
 p_as_of_date=>current_date,p_interest_percent=>2.5,p_interest_period=>'monthly')$$,
 '22023','Invalid debt observation or missing rate provenance','rate missing provenance rejected');

select throws_ok($$select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Synthetic terms',
 p_as_of_date=>current_date,p_interest_percent=>2.5,p_interest_period=>'quarterly',
 p_interest_source=>'Synthetic contract')$$,
 '22023','Invalid debt observation or missing rate provenance','rate unit not silently converted');

select throws_ok($$select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Synthetic terms',
 p_as_of_date=>current_date,p_balance_cents=>-1)$$,
 '22023','Invalid debt observation or missing rate provenance','negative debt not allowed');

select throws_ok($$select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Synthetic terms',
 p_as_of_date=>current_date,p_cet_percent=>25,p_cet_period=>'annual')$$,
 '22023','Invalid debt observation or missing rate provenance','CET source must exist');

select throws_ok($select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Overprecise synthetic interest',
 p_as_of_date=>current_date,p_interest_percent=>2.123456789,p_interest_period=>'monthly',
 p_interest_source=>'Synthetic contract')$,
 '22023','Invalid debt observation or missing rate provenance',
 'rate over eight decimal places rejected instead of silently rounded');

select throws_ok($select public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Overprecise synthetic CET',
 p_as_of_date=>current_date,p_cet_percent=>31.123456789,p_cet_period=>'annual',
 p_cet_source=>'Synthetic CET')$,
 '22023','Invalid debt observation or missing rate provenance',
 'CET over eight decimal places rejected instead of silently rounded');

select ok(public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Synthetic statement',
 p_as_of_date=>current_date,p_balance_cents=>90000,p_minimum_due_cents=>9000,
 p_due_date=>current_date+10,p_interest_percent=>2.125,p_interest_period=>'monthly',
 p_interest_source=>'Synthetic finance contract',p_cet_percent=>31.75,
 p_cet_period=>'annual',p_cet_source=>'Synthetic CET disclosure',
 p_penalty_fixed_cents=>250,p_consequences=>'Synthetic late fee disclosure') is not null,
 'record exact terms with explicit provenance');

select is((select balance_cents from public.finance_debt_latest),'90000','money exposed as exact cent text');

select is((select interest_percent from public.finance_debt_latest),'2.12500000','monthly rate percent preserved exactly');

select is((select interest_period from public.finance_debt_latest),'monthly','rate unit remains explicit');

select is((select cet_period from public.finance_debt_latest),'annual','CET annual not confused with monthly rate');

select is((select has_missing_cost_data from public.finance_debt_latest),false,'complete documented terms flagged as complete');

select ok(public.finance_record_debt_observation(
 p_debt_id=>current_setting('finance_ai.m04_debt')::uuid,p_source_reference=>'Older synthetic note',
 p_as_of_date=>current_date-12,p_balance_cents=>91000) is not null,
 'append older historical source without overwriting current');

select is((select balance_cents from public.finance_debt_latest),'90000','historical late import cannot overwrite newer as-of');

select is((select count(*)::integer from public.finance_debt_observations),2,'original snapshot and older source both preserved');

select throws_ok($$update public.finance_debt_observations set balance_cents=100
 where debt_id=current_setting('finance_ai.m04_debt')::uuid$$,
 '42501',null,'authenticated client cannot rewrite debt snapshots');

select ok(public.finance_create_debt('b5000000-0000-4000-8000-0000000000b5','Store synthetic creditor') is not null,'same owner can create in isolated store space');

select is((select count(*)::integer from public.finance_debts),2,'owner can read only own two debt spaces');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-0000000000a5',true);

select is((select count(*)::integer from public.finance_debts),0,'foreign wallet sees zero debts');

select is((select count(*)::integer from public.finance_debt_observations),0,'foreign wallet sees zero snapshots');

select is((select count(*)::integer from public.finance_debt_latest),0,'invoker latest view respects foreign RLS');

select throws_ok($$select public.finance_record_debt_observation(
 current_setting('finance_ai.m04_debt')::uuid,'Foreign synthetic source',current_date)$$,
 '42501','Not an authorized finance owner','foreign wallet cannot append');

reset role;
delete from finance_private.authorized_owners
 where owner_id='a4000000-0000-4000-8000-0000000000a4';
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-0000000000a4',true);

select is((select count(*)::integer from public.finance_debts),0,'revoked owner loses debts');

select is((select count(*)::integer from public.finance_debt_latest),0,'revoked owner loses latest view');

select * from finish();
rollback;
