-- FAI-M03 pgTAP synthetic-only commitments and recurrence, no external payments.
begin;
select plan(43);
select has_table('public','finance_commitments','commitments table exists');

select has_table('public','finance_recurring_plans','recurring plans table exists');

select has_table('public','finance_commitment_settlements','settlement link table exists');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='public.finance_commitments'::regclass),'commitment RLS forced');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='public.finance_commitment_settlements'::regclass),'settlement RLS forced');

select ok(not has_table_privilege('authenticated','public.finance_commitments','INSERT') and not has_table_privilege('authenticated','public.finance_commitments','UPDATE'),'direct commitment mutations blocked');

select ok(not has_table_privilege('authenticated','public.finance_commitment_settlements','INSERT'),'direct settlement insertion blocked');

select ok(not has_table_privilege('anon','public.finance_commitment_forecast','SELECT'),'anonymous forecast denied');

insert into auth.users(id) values ('a1000000-0000-4000-8000-0000000000a1'),('a2000000-0000-4000-8000-0000000000a2');
set local role authenticated;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-0000000000a1',true);

select throws_ok($$select public.finance_create_commitment(
 'b1000000-0000-4000-8000-0000000000b1','payable','Denied',100,current_date,100)$$,
 '42501','Not an authorized finance owner','unprovisioned owner denied');

reset role;
insert into finance_private.authorized_owners(owner_id) values('a1000000-0000-4000-8000-0000000000a1');
set local role authenticated;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-0000000000a1',true);
insert into public.finance_spaces(id,owner_id,space_type,display_name) values
 ('b1000000-0000-4000-8000-0000000000b1','a1000000-0000-4000-8000-0000000000a1','personal','Synthetic personal'),
 ('b2000000-0000-4000-8000-0000000000b2','a1000000-0000-4000-8000-0000000000a1','store','Synthetic store');
insert into public.finance_accounts(id,owner_id,space_id,account_type,name,opening_balance_cents,opening_balance_date)
 values ('c1000000-0000-4000-8000-0000000000c1','a1000000-0000-4000-8000-0000000000a1',
 'b1000000-0000-4000-8000-0000000000b1','bank','Bank',10000,current_date);
insert into public.finance_categories(id,owner_id,space_id,kind,name) values
 ('d1000000-0000-4000-8000-0000000000d1','a1000000-0000-4000-8000-0000000000a1',
 'b1000000-0000-4000-8000-0000000000b1','expense','Expense'),
 ('d2000000-0000-4000-8000-0000000000d2','a1000000-0000-4000-8000-0000000000a1',
 'b1000000-0000-4000-8000-0000000000b1','income','Income');

select throws_ok($$select public.finance_create_commitment(
 'b1000000-0000-4000-8000-0000000000b1','payable','Invalid',100,current_date,45)$$,
 '22023','Invalid commitment parameters','payable requires certainty 100');

select throws_ok($$select public.finance_create_commitment(
 'b1000000-0000-4000-8000-0000000000b1','payable','Invalid',0,current_date,100)$$,
 '22023','Invalid commitment parameters','zero value rejected');

select ok(public.finance_create_commitment(
 'b1000000-0000-4000-8000-0000000000b1','payable','Synthetic electricity bill',250,current_date,100) is not null,
 'create payable via owner RPC');

select set_config('finance_ai.m03_payable',(select id::text from public.finance_commitments
 where description='Synthetic electricity bill'),true);

select ok(public.finance_create_commitment(
 'b1000000-0000-4000-8000-0000000000b1','receivable','Synthetic order',750,current_date+7,35) is not null,
 'create uncertain receivable via owner RPC');

select set_config('finance_ai.m03_receivable',(select id::text from public.finance_commitments
 where description='Synthetic order'),true);

select is((select current_balance_cents::numeric from public.finance_account_balances where account_id='c1000000-0000-4000-8000-0000000000c1'),10000::numeric,'forecast does not change confirmed balances');

select is((select count(*)::integer from public.finance_commitment_forecast),2,'two future-only forecast items');

select is((select confidence_percent from public.finance_commitment_forecast where kind='receivable'),35,'uncertain confidence preserved');

select is((select projected_signed_cents from public.finance_commitment_forecast where kind='payable'),'-250','payable cash effect negative');

select throws_ok($$select public.finance_settle_commitment(
 current_setting('finance_ai.m03_payable')::uuid,
 'c1000000-0000-4000-8000-0000000000c1',
 'd2000000-0000-4000-8000-0000000000d2',current_date)$$,
 '42501','Category unavailable for account space and type',
 'settlement refuses wrong category type and rolls back');

select is((select status from public.finance_commitments where id=current_setting('finance_ai.m03_payable')::uuid),'open','failed settlement preserves open state');

select ok(public.finance_settle_commitment(current_setting('finance_ai.m03_payable')::uuid,
 'c1000000-0000-4000-8000-0000000000c1',
 'd1000000-0000-4000-8000-0000000000d1',current_date) is not null,
 'settle payable exactly once in same ledger transaction');

select is((select current_balance_cents::numeric from public.finance_account_balances where account_id='c1000000-0000-4000-8000-0000000000c1'),9750::numeric,'one payable decreases confirmed amount once');

select is((select count(*)::integer from public.finance_commitment_settlements),1,'exactly one settlement link');

select is((select count(*)::integer from public.finance_commitment_forecast),1,'settled payable removed from forecast');

select throws_ok($$select public.finance_settle_commitment(current_setting('finance_ai.m03_payable')::uuid,
 'c1000000-0000-4000-8000-0000000000c1',
 'd1000000-0000-4000-8000-0000000000d1',current_date)$$,
 '22023','Commitment not open or unavailable','double settlement denied');

select is((select count(*)::integer from public.finance_ledger_entries where description='Synthetic electricity bill'),1,'no duplicate ledger after double call');

select throws_ok($$select public.finance_cancel_entry((select ledger_entry_id
 from public.finance_commitment_settlements limit 1))$$,
 '23514','Settled commitment ledger cannot be reversed independently',
 'settled entry cannot be canceled separately');

select throws_ok($$select public.finance_correct_entry((select ledger_entry_id
 from public.finance_commitment_settlements limit 1),
 'd1000000-0000-4000-8000-0000000000d1',300,current_date,'Forged fix')$$,
 '23514','Settled commitment ledger cannot be reversed independently',
 'settled entry cannot be corrected separately');

select is((select count(*)::integer from public.finance_ledger_entries),1,'blocked edits leave original ledger intact');

select ok(public.finance_cancel_commitment(current_setting('finance_ai.m03_receivable')::uuid) is not null,
 'cancel open receivable without ledger entry');

select is((select count(*)::integer from public.finance_commitment_forecast),0,'canceled receivable not projected');

select is((select current_balance_cents::numeric from public.finance_account_balances where account_id='c1000000-0000-4000-8000-0000000000c1'),9750::numeric,'cancel future receivable does not change confirmed balance');

select throws_ok($$select public.finance_cancel_commitment(current_setting('finance_ai.m03_receivable')::uuid)$$,
 '22023','Commitment not open or unavailable','cannot cancel twice');

insert into public.finance_recurring_plans(id,owner_id,space_id,kind,description,
 amount_cents,first_due_date,frequency,confidence_percent) values
 ('e1000000-0000-4000-8000-0000000000e1','a1000000-0000-4000-8000-0000000000a1',
 'b1000000-0000-4000-8000-0000000000b1','payable','Synthetic rent',800,
 date '2026-01-31','monthly',100);

select is(public.finance_generate_commitments('e1000000-0000-4000-8000-0000000000e1',date '2026-03-31'),3,
 'Jan31 February clamp March31 monthly anchor correct');

select is(public.finance_generate_commitments('e1000000-0000-4000-8000-0000000000e1',date '2026-03-31'),0,
 'same horizon generation idempotent');

select is((select count(*)::integer from public.finance_commitments where series_id='e1000000-0000-4000-8000-0000000000e1'),3,'recurrences unique by date');

select ok(exists(select 1 from public.finance_commitments where due_date=date '2026-02-28' and series_id='e1000000-0000-4000-8000-0000000000e1'),'month-end recurrence clamped');

select throws_ok($$select public.finance_generate_commitments(
 'e1000000-0000-4000-8000-0000000000e1',date '2029-01-31')$$,
 '22023','Invalid bounded recurrence horizon','unbounded recurrence denied');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-0000000000a2',true);

select is((select count(*)::integer from public.finance_commitments),0,'other wallet sees no commitments');

select is((select count(*)::integer from public.finance_recurring_plans),0,'other wallet sees no recurring plans');

select is((select count(*)::integer from public.finance_commitment_settlements),0,'other wallet sees no settlement');

select throws_ok($$select public.finance_settle_commitment(
 current_setting('finance_ai.m03_payable')::uuid,
 'c1000000-0000-4000-8000-0000000000c1',
 'd1000000-0000-4000-8000-0000000000d1',current_date)$$,
 '42501','Not an authorized finance owner','other wallet cannot settle');

reset role;
delete from finance_private.authorized_owners where owner_id='a1000000-0000-4000-8000-0000000000a1';
set local role authenticated;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-0000000000a1',true);

select is((select count(*)::integer from public.finance_commitments),0,'revoked owner loses commitments');

select is((select count(*)::integer from public.finance_commitment_forecast),0,'revoked owner loses forecast');

select * from finish();
rollback;
