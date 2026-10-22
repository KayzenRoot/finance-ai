begin;
select plan(21);

select has_table('finance_private', 'authorized_owners', 'private single-owner registry exists');

select ok(
  not has_schema_privilege('authenticated', 'finance_private', 'USAGE')
  and not has_schema_privilege('anon', 'finance_private', 'USAGE')
  and not has_table_privilege('authenticated', 'finance_private.authorized_owners', 'SELECT'),
  'neither authenticated nor anonymous users can inspect the owner registry'
);

select has_table('public', 'finance_spaces', 'finance_spaces is present');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.finance_spaces'::regclass),
  'row level security is enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'public.finance_spaces'::regclass),
  'row level security also applies to the table owner'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'finance_spaces' and policyname = 'finance_spaces_select_own'),
  'owner select policy exists'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'finance_spaces' and policyname = 'finance_spaces_insert_own'),
  'owner insert policy exists'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'finance_spaces' and policyname = 'finance_spaces_update_own'),
  'owner update policy exists'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'finance_spaces' and policyname = 'finance_spaces_delete_own'),
  'owner delete policy exists'
);
select ok(
  has_table_privilege('authenticated', 'public.finance_spaces', 'SELECT')
    and has_table_privilege('authenticated', 'public.finance_spaces', 'INSERT')
    and has_table_privilege('authenticated', 'public.finance_spaces', 'UPDATE')
    and has_table_privilege('authenticated', 'public.finance_spaces', 'DELETE'),
  'authenticated has only the intended table operations'
);
select ok(
  not has_table_privilege('anon', 'public.finance_spaces', 'SELECT')
    and not has_table_privilege('anon', 'public.finance_spaces', 'INSERT'),
  'anon has no access to finance spaces'
);

insert into auth.users (id)
values
  ('10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$insert into public.finance_spaces (owner_id, space_type, display_name)
    values ('10000000-0000-4000-8000-000000000001', 'personal', 'Pessoal')$$,
  '42501',
  'new row violates row-level security policy for table "finance_spaces"',
  'wallet cannot insert before explicit owner provisioning'
);
reset role;
insert into finance_private.authorized_owners (owner_id)
values ('10000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$insert into public.finance_spaces (owner_id, space_type, display_name)
    values ('10000000-0000-4000-8000-000000000001', 'personal', 'Pessoal')$$,
  'owner can create a personal space'
);
select is(
  (select count(*)::integer from public.finance_spaces),
  1,
  'owner can read their own space'
);
select throws_ok(
  $$insert into public.finance_spaces (owner_id, space_type, display_name)
    values ('20000000-0000-4000-8000-000000000002', 'personal', 'Outro titular')$$,
  '42501',
  'new row violates row-level security policy for table "finance_spaces"',
  'owner cannot create a space for another user'
);
select throws_ok(
  $$update public.finance_spaces
    set owner_id = '20000000-0000-4000-8000-000000000002'
    where owner_id = '10000000-0000-4000-8000-000000000001'$$,
  '42501',
  'new row violates row-level security policy for table "finance_spaces"',
  'owner cannot transfer a space to another user'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select is(
  (select count(*)::integer from public.finance_spaces),
  0,
  'another user cannot read the first owner space'
);
select throws_ok(
  $$insert into public.finance_spaces (owner_id, space_type, display_name)
    values ('20000000-0000-4000-8000-000000000002', 'personal', 'Unauthorized wallet')$$,
  '42501',
  'new row violates row-level security policy for table "finance_spaces"',
  'another authenticated wallet cannot create even its own space'
);
with changed as (
  update public.finance_spaces
  set display_name = 'alterado'
  where owner_id = '10000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*)::integer from changed),
  0,
  'another user cannot update the first owner space'
);
with removed as (
  delete from public.finance_spaces
  where owner_id = '10000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*)::integer from removed),
  0,
  'another user cannot delete the first owner space'
);

-- Revoking the owner must remove access to previously created spaces
-- without deleting the financial records themselves.
reset role;
delete from finance_private.authorized_owners
  where owner_id = '10000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select is(
  (select count(*)::integer from public.finance_spaces),
  0,
  'revocation immediately hides previously owned spaces'
);

select * from finish();
rollback;
