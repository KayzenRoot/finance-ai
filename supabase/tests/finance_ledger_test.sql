-- FAI-M02 pgTAP: 35 isolated synthetic checks, no real funds.
begin;
-- All fixture identifiers and balances are synthetic. The transaction rolls back.
select plan(35);
select has_table('public','finance_categories','M02 categories table exists');

select has_table('public','finance_ledger_entries','M02 immutable entries table exists');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='public.finance_categories'::regclass),'categories use forced RLS');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='public.finance_ledger_entries'::regclass),'ledger uses forced RLS');

select ok(not has_table_privilege('authenticated','public.finance_ledger_entries','INSERT') and not has_table_privilege('authenticated','public.finance_ledger_entries','UPDATE') and not has_table_privilege('authenticated','public.finance_ledger_entries','DELETE'),'ledger direct mutation disallowed');

select ok(not has_table_privilege('anon','public.finance_ledger_entries','SELECT'),'no public ledger access');

insert into auth.users(id) values ('61000000-0000-4000-8000-000000000061'),('62000000-0000-4000-8000-000000000062');
set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-4000-8000-000000000061',true);

select throws_ok($$insert into public.finance_categories(owner_id,space_id,kind,name)
 values ('61000000-0000-4000-8000-000000000061','71000000-0000-4000-8000-000000000071','income','Denied')$$,
 '42501',null,'unknown wallet cannot insert categories');

reset role;
insert into finance_private.authorized_owners(owner_id) values ('61000000-0000-4000-8000-000000000061');
set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-4000-8000-000000000061',true);
insert into public.finance_spaces(id,owner_id,space_type,display_name) values
 ('71000000-0000-4000-8000-000000000071','61000000-0000-4000-8000-000000000061','personal','Pessoal'),
 ('72000000-0000-4000-8000-000000000072','61000000-0000-4000-8000-000000000061','store','Loja');
insert into public.finance_accounts(id,owner_id,space_id,account_type,name,opening_balance_cents,opening_balance_date) values
 ('81000000-0000-4000-8000-000000000081','61000000-0000-4000-8000-000000000061','71000000-0000-4000-8000-000000000071','bank','Banco',10000,current_date),
 ('82000000-0000-4000-8000-000000000082','61000000-0000-4000-8000-000000000061','72000000-0000-4000-8000-000000000072','cash','Caixa',5000,current_date);
insert into public.finance_categories(id,owner_id,space_id,kind,name) values
 ('91000000-0000-4000-8000-000000000091','61000000-0000-4000-8000-000000000061','71000000-0000-4000-8000-000000000071','income','Vendas'),
 ('92000000-0000-4000-8000-000000000092','61000000-0000-4000-8000-000000000061','72000000-0000-4000-8000-000000000072','expense','Materiais'),
 ('93000000-0000-4000-8000-000000000093','61000000-0000-4000-8000-000000000061','71000000-0000-4000-8000-000000000071','expense','Casa');

select is((select count(*)::integer from public.finance_categories),3,'authorized owner sees own categories');

select throws_ok($$insert into public.finance_categories(owner_id,space_id,kind,name)
 values ('61000000-0000-4000-8000-000000000061','71000000-0000-4000-8000-000000000071','income','vendas')$$,
 '23505',null,'active category names are unique case-insensitively');

select throws_ok($$update public.finance_categories set kind='expense' where id='91000000-0000-4000-8000-000000000091'$$,
 '23514','Category identity and archival are immutable','category type cannot be reassigned');

select is(public.finance_record_entry('81000000-0000-4000-8000-000000000081',
 '91000000-0000-4000-8000-000000000091','income',3000,current_date,'Synthetic income') is not null,true,'record exact income via RPC');

select set_config('finance_ai.m02_income',(select id::text from public.finance_ledger_entries
 where description='Synthetic income' and entry_role='original'),true);

select is(public.finance_record_entry('82000000-0000-4000-8000-000000000082',
 '92000000-0000-4000-8000-000000000092','expense',500,current_date,'Synthetic expense') is not null,true,'record exact expense via RPC');

select set_config('finance_ai.m02_expense',(select id::text from public.finance_ledger_entries
 where description='Synthetic expense' and entry_role='original'),true);

select is((select current_balance_cents::numeric from public.finance_account_balances
 where account_id='81000000-0000-4000-8000-000000000081'),13000::numeric,'income increases reference balance');

select is((select current_balance_cents::numeric from public.finance_account_balances
 where account_id='82000000-0000-4000-8000-000000000082'),4500::numeric,'expense reduces reference balance');

select is((select sum(current_balance_cents::numeric) from public.finance_account_balances),17500::numeric,'consolidated sum correct');

select throws_ok($$select public.finance_record_entry('81000000-0000-4000-8000-000000000081',
 '92000000-0000-4000-8000-000000000092','expense',100,current_date,'Cross-space')$$,
 '42501','Category unavailable for account space and type','cross-space category denied');

select throws_ok($$select public.finance_record_entry('81000000-0000-4000-8000-000000000081',
 '93000000-0000-4000-8000-000000000093','income',100,current_date,'Wrong type')$$,
 '42501','Category unavailable for account space and type','income category type must match entry');

select throws_ok($$select public.finance_record_entry('81000000-0000-4000-8000-000000000081',
 '91000000-0000-4000-8000-000000000091','income',0,current_date,'Zero')$$,
 '22023','Invalid ledger parameters','no zero cent entry');

select throws_ok($$select public.finance_record_entry('81000000-0000-4000-8000-000000000081',
 '91000000-0000-4000-8000-000000000091','income',100,current_date+1,'Future')$$,
 '22023','Invalid ledger parameters','confirmed entry cannot have future effective date');

select throws_ok($$select public.finance_record_entry('81000000-0000-4000-8000-000000000081',
 '91000000-0000-4000-8000-000000000091','income',100,current_date-1,'Before reference')$$,
 '42501','Account unavailable or before reference date','entry cannot predate reference balance');

select public.finance_record_transfer(
 '81000000-0000-4000-8000-000000000081',
 '82000000-0000-4000-8000-000000000082',2000,current_date);

select is((select sum(current_balance_cents::numeric) from public.finance_account_balances),17500::numeric,'internal transfer never double counts consolidated actuals');

select is(public.finance_cancel_entry(current_setting('finance_ai.m02_income')::uuid) is not null,true,
 'cancellation creates audit reversal');

select is((select current_balance_cents::numeric from public.finance_account_balances where account_id='81000000-0000-4000-8000-000000000081'),8000::numeric,'cancellation offsets income without rewriting history');

select throws_ok($$select public.finance_cancel_entry(current_setting('finance_ai.m02_income')::uuid)$$,
 '22023','Entry unavailable or already reversed','double cancellation is denied');

select is(public.finance_correct_entry(current_setting('finance_ai.m02_expense')::uuid,
 '92000000-0000-4000-8000-000000000092',700,current_date,'Adjusted synthetic expense') is not null,true,
 'correction creates replacement atomically');

select is((select count(*)::integer from public.finance_ledger_entries),5,'originals reversals and replacement remain in audit history');

select is((select sum(current_balance_cents::numeric) from public.finance_account_balances),14300::numeric,'corrected consolidated exact amount');

select throws_ok($$select public.finance_correct_entry(current_setting('finance_ai.m02_expense')::uuid,
 '92000000-0000-4000-8000-000000000092',800,current_date,'Duplicate correction')$$,
 '22023','Entry unavailable or already reversed','second correction of reversed original rejected');

select throws_ok($$select public.finance_cancel_entry('00000000-0000-4000-8000-000000000000')$$,
 '22023','Entry unavailable or already reversed','missing entry is rejected');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','62000000-0000-4000-8000-000000000062',true);

select is((select count(*)::integer from public.finance_categories),0,'other wallet cannot read categories');

select is((select count(*)::integer from public.finance_ledger_entries),0,'other wallet cannot read ledger');

select is((select count(*)::integer from public.finance_ledger_legs),0,'invoker ledger legs respect owner');

select throws_ok($$select public.finance_cancel_entry(current_setting('finance_ai.m02_income')::uuid)$$,
 '42501','Not an authorized finance owner','other wallet cannot cancel original entry');

reset role;
delete from finance_private.authorized_owners where owner_id='61000000-0000-4000-8000-000000000061';
set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-4000-8000-000000000061',true);

select is((select count(*)::integer from public.finance_ledger_entries),0,'revoked owner loses all ledger access');

select is((select count(*)::integer from public.finance_categories),0,'revoked owner loses all category access');

select * from finish();
rollback;
