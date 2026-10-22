begin;
select plan(16);

select has_table('public', 'finance_spaces', 'finance_spaces is present');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.finance_spaces'::regclass),
  'row level security is enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'public.finance_spaces'::regclass),
  'row level security also applies to the table owner'
);
select has_policy('public', 'finance_spaces', 'finance_spaces_select_own', 'owner select policy exists');
select has_policy('public', 'finance_spaces', 'finance_spaces_insert_own', 'owner insert policy exists');
select has_policy('public', 'finance_spaces', 'finance_spaces_update_own', 'owner update policy exists');
select has_policy('public', 'finance_spaces', 'finance_spaces_delete_own', 'owner delete policy exists');
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
  'owner cannot create a space for another user'
);
select throws_ok(
  $$update public.finance_spaces
    set owner_id = '20000000-0000-4000-8000-000000000002'
    where owner_id = '10000000-0000-4000-8000-000000000001'$$,
  '42501',
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
select is(
  (with changed as (
    update public.finance_spaces
    set display_name = 'alterado'
    where owner_id = '10000000-0000-4000-8000-000000000001'
    returning 1
  ) select count(*)::integer from changed),
  0,
  'another user cannot update the first owner space'
);
select is(
  (with removed as (
    delete from public.finance_spaces
    where owner_id = '10000000-0000-4000-8000-000000000001'
    returning 1
  ) select count(*)::integer from removed),
  0,
  'another user cannot delete the first owner space'
);

select * from finish();
rollback;
