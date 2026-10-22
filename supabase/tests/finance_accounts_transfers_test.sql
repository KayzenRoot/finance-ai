-- pgTAP M01: synthetic users and balances, rolled back after each run.
begin;
select plan(28);
select has_table('public', 'finance_accounts', 'accounts table exists');

select has_table('public', 'finance_transfers', 'internal transfer table exists');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.finance_accounts'::regclass), 'accounts enforce RLS');

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.finance_transfers'::regclass), 'transfers enforce RLS');

select ok(not has_table_privilege('authenticated', 'public.finance_transfers', 'INSERT') and has_table_privilege('authenticated','public.finance_transfers','SELECT'), 'transfer writes only through RPC');

select ok(not has_table_privilege('anon', 'public.finance_accounts', 'SELECT'), 'anonymous access is forbidden');

insert into auth.users (id) values ('31000000-0000-4000-8000-000000000031'), ('32000000-0000-4000-8000-000000000032');
set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-4000-8000-000000000031',true);

select throws_ok($$insert into public.finance_spaces (owner_id,space_type,display_name)
  values ('31000000-0000-4000-8000-000000000031','personal','Blocked')$$,
  '42501','new row violates row-level security policy for table "finance_spaces"',
  'unknown wallet cannot create spaces');

reset role;
insert into finance_private.authorized_owners (owner_id)
values ('31000000-0000-4000-8000-000000000031');
set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-4000-8000-000000000031',true);
insert into public.finance_spaces (id,owner_id,space_type,display_name) values
 ('41000000-0000-4000-8000-000000000041','31000000-0000-4000-8000-000000000031','personal','Pessoal'),
 ('42000000-0000-4000-8000-000000000042','31000000-0000-4000-8000-000000000031','store','Loja');
insert into public.finance_accounts (id, owner_id, space_id, account_type, name, opening_balance_cents, opening_balance_date) values
 ('51000000-0000-4000-8000-000000000051','31000000-0000-4000-8000-000000000031','41000000-0000-4000-8000-000000000041','bank','Banco',10000,current_date),
 ('52000000-0000-4000-8000-000000000052','31000000-0000-4000-8000-000000000031','42000000-0000-4000-8000-000000000042','cash','Caixa',5000,current_date),
 ('53000000-0000-4000-8000-000000000053','31000000-0000-4000-8000-000000000031','41000000-0000-4000-8000-000000000041','card','Cartao',2000,current_date);

select is((select count(*)::integer from public.finance_accounts),3,'owner sees three accounts');

select is((select count(*)::integer from public.finance_accounts where space_id='41000000-0000-4000-8000-000000000041'),2,'personal space filter');

select is((select sum(current_balance_cents::numeric) from public.finance_account_balances),17000::numeric,'opening total in integer cents');

select throws_ok($$update public.finance_accounts set owner_id='32000000-0000-4000-8000-000000000032'
 where id='51000000-0000-4000-8000-000000000051'$$,
 '23514','Account identity, owner, space and currency are immutable','account cannot be reparented');

select ok(public.finance_record_transfer(
 '51000000-0000-4000-8000-000000000051',
 '52000000-0000-4000-8000-000000000052',3000,current_date) is not null, 'transfer recorded via RPC');

select is((select current_balance_cents::numeric from public.finance_account_balances where account_id='51000000-0000-4000-8000-000000000051'),7000::numeric,'origin has debit');

select is((select current_balance_cents::numeric from public.finance_account_balances where account_id='52000000-0000-4000-8000-000000000052'),8000::numeric,'destination has credit');

select is((select sum(signed_amount_cents) from public.finance_transfer_legs),0::numeric,'paired legs consolidate to zero');

select is((select sum(current_balance_cents::numeric) from public.finance_account_balances),17000::numeric,'transfer does not double count consolidated cash');

select throws_ok($$select public.finance_record_transfer(
 '51000000-0000-4000-8000-000000000051',
 '52000000-0000-4000-8000-000000000052',0,current_date)$$,
 '22023','Invalid internal transfer parameters','reject zero amounts');

select throws_ok($$select public.finance_record_transfer(
 '51000000-0000-4000-8000-000000000051',
 '51000000-0000-4000-8000-000000000051',100,current_date)$$,
 '22023','Invalid internal transfer parameters','reject self transfer');

select throws_ok($$update public.finance_accounts set opening_balance_cents=999
 where id='51000000-0000-4000-8000-000000000051'$$,
 '23514','Account reference balance is frozen after an internal transfer','reference balance cannot be overwritten');

update public.finance_accounts set archived_at=now() where id='52000000-0000-4000-8000-000000000052';

select is((select sum(current_balance_cents::numeric) from public.finance_account_balances),17000::numeric,
 'archiving preserves consolidated reference, including historical accounts');
select is((select pg_typeof(current_balance_cents)::text from public.finance_account_balances limit 1),
 'text', 'PostgREST balance payloads preserve arbitrary cent precision as text');

select throws_ok($$select public.finance_record_transfer(
 '51000000-0000-4000-8000-000000000051',
 '52000000-0000-4000-8000-000000000052',100,current_date)$$,
 '42501','Transfer accounts unavailable or archived','reject archived target');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','32000000-0000-4000-8000-000000000032',true);

select is((select count(*)::integer from public.finance_accounts),0,'different wallet cannot read accounts');

select is((select count(*)::integer from public.finance_transfers),0,'different wallet cannot read transfers');

select is((select count(*)::integer from public.finance_account_balances),0,'invoker view does not bypass RLS');

select throws_ok($$select public.finance_record_transfer(
 '51000000-0000-4000-8000-000000000051',
 '52000000-0000-4000-8000-000000000052',100,current_date)$$,
 '42501','Not an authorized finance owner','other wallet cannot use RPC');

reset role;
delete from finance_private.authorized_owners where owner_id='31000000-0000-4000-8000-000000000031';
set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-4000-8000-000000000031',true);

select is((select count(*)::integer from public.finance_accounts),0,'revoked wallet loses accounts immediately');

select is((select count(*)::integer from public.finance_transfers),0,'revoked wallet loses transfer history immediately');

select * from finish();
rollback;
