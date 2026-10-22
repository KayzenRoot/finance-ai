-- M00 establishes tenant boundaries only. Financial records are added in later modules.
create table public.finance_spaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  space_type text not null check (space_type in ('personal', 'store')),
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (owner_id, space_type)
);

alter table public.finance_spaces enable row level security;
alter table public.finance_spaces force row level security;

revoke all on schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;

revoke all on table public.finance_spaces from public, anon, authenticated;
grant select, insert, update, delete on table public.finance_spaces to authenticated;

create policy finance_spaces_select_own
  on public.finance_spaces
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy finance_spaces_insert_own
  on public.finance_spaces
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy finance_spaces_update_own
  on public.finance_spaces
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy finance_spaces_delete_own
  on public.finance_spaces
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

alter default privileges in schema public
  revoke all on tables from anon, authenticated;
