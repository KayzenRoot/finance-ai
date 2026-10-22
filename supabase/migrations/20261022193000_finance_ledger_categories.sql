-- FAI-M02: exact BRL ledger, space-scoped categories and immutable correction history.
-- All data is synthetic in CI. No payment initiation or external bank access.
alter table public.finance_accounts
  add constraint finance_accounts_id_owner_space_unique unique (id, owner_id, space_id);

create table public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  kind text not null check (kind in ('income', 'expense')),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint finance_categories_space_owner_fk foreign key (space_id,owner_id)
    references public.finance_spaces(id,owner_id) on delete restrict,
  constraint finance_categories_identity_unique unique (id,owner_id,space_id,kind)
);
create unique index finance_categories_active_name_unique
  on public.finance_categories (owner_id,space_id,kind,lower(btrim(name)))
  where archived_at is null;
create index finance_categories_owner_space_idx
  on public.finance_categories(owner_id,space_id,kind);

-- Category rename/archive is allowed; reassigning identity/space/kind would
-- retroactively change the meaning of existing ledger records.
create function public.finance_category_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id or new.owner_id is distinct from old.owner_id
     or new.space_id is distinct from old.space_id or new.kind is distinct from old.kind
     or new.created_at is distinct from old.created_at
     or (old.archived_at is not null and new.archived_at is distinct from old.archived_at) then
    raise exception 'Category identity and archival are immutable' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger finance_categories_guard_update before update on public.finance_categories
  for each row execute function public.finance_category_guard();

create table public.finance_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  account_id uuid not null,
  category_id uuid not null,
  kind text not null check (kind in ('income','expense')),
  amount_cents bigint not null check (amount_cents between 1 and 9000000000000000),
  effective_date date not null,
  description text not null check (char_length(btrim(description)) between 1 and 240),
  source text not null default 'manual' check (source='manual'),
  entry_role text not null check (entry_role in ('original','reversal','replacement')),
  reverses_entry_id uuid references public.finance_ledger_entries(id) on delete restrict,
  corrects_entry_id uuid references public.finance_ledger_entries(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint finance_ledger_account_space_fk
    foreign key (account_id,owner_id,space_id)
    references public.finance_accounts(id,owner_id,space_id) on delete restrict,
  constraint finance_ledger_category_space_kind_fk
    foreign key (category_id,owner_id,space_id,kind)
    references public.finance_categories(id,owner_id,space_id,kind) on delete restrict,
  constraint finance_ledger_role_shape check (
    (entry_role='original' and reverses_entry_id is null and corrects_entry_id is null)
    or (entry_role='reversal' and reverses_entry_id is not null and corrects_entry_id is null)
    or (entry_role='replacement' and reverses_entry_id is null and corrects_entry_id is not null)
  ),
  constraint finance_ledger_no_self_reverse check (id is distinct from reverses_entry_id),
  constraint finance_ledger_no_self_correct check (id is distinct from corrects_entry_id)
);
create unique index finance_ledger_unique_reversal on public.finance_ledger_entries(reverses_entry_id)
  where reverses_entry_id is not null;
create unique index finance_ledger_unique_replacement on public.finance_ledger_entries(corrects_entry_id)
  where corrects_entry_id is not null;
create index finance_ledger_owner_space_date_idx on public.finance_ledger_entries
  (owner_id,space_id,effective_date desc,created_at desc);
create index finance_ledger_account_date_idx on public.finance_ledger_entries
  (account_id,effective_date desc);

alter table public.finance_categories enable row level security;
alter table public.finance_categories force row level security;
alter table public.finance_ledger_entries enable row level security;
alter table public.finance_ledger_entries force row level security;
revoke all on public.finance_categories,public.finance_ledger_entries from public,anon,authenticated;
grant select,insert,update on public.finance_categories to authenticated;
grant select on public.finance_ledger_entries to authenticated;
create policy finance_categories_owner_select on public.finance_categories
  for select to authenticated
  using ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));
create policy finance_categories_owner_insert on public.finance_categories
  for insert to authenticated
  with check ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));
create policy finance_categories_owner_update on public.finance_categories
  for update to authenticated
  using ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()))
  with check ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));
create policy finance_ledger_owner_select on public.finance_ledger_entries
  for select to authenticated
  using ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));

-- All mutations are controlled by RPCs; direct inserts/updates/deletes are disallowed.
-- The issuer is always auth.uid(), never a caller-supplied owner.
create function public.finance_record_entry(
  p_account_id uuid,p_category_id uuid,p_kind text,p_amount_cents bigint,
  p_effective_date date,p_description text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
  v_owner uuid := auth.uid();
  v_account public.finance_accounts%rowtype;
  v_category public.finance_categories%rowtype;
  v_id uuid;
begin
  if v_owner is null or not (select public.finance_is_authorized_owner()) then
    raise exception 'Not an authorized finance owner' using errcode='42501';
  end if;
  if p_kind is null or p_kind not in ('income','expense') or
     p_amount_cents is null or p_amount_cents not between 1 and 9000000000000000
     or p_effective_date is null or p_effective_date > current_date
     or p_description is null or char_length(btrim(p_description)) not between 1 and 240 then
    raise exception 'Invalid ledger parameters' using errcode='22023';
  end if;
  select * into v_account from public.finance_accounts
    where id=p_account_id and owner_id=v_owner for share;
  if v_account.id is null or v_account.archived_at is not null
     or p_effective_date < v_account.opening_balance_date then
    raise exception 'Account unavailable or before reference date' using errcode='42501';
  end if;
  select * into v_category from public.finance_categories
    where id=p_category_id and owner_id=v_owner
      and space_id=v_account.space_id and kind=p_kind for share;
  if v_category.id is null or v_category.archived_at is not null then
    raise exception 'Category unavailable for account space and type' using errcode='42501';
  end if;
  insert into public.finance_ledger_entries
    (owner_id,space_id,account_id,category_id,kind,amount_cents,effective_date,description,entry_role)
  values
    (v_owner,v_account.space_id,p_account_id,p_category_id,p_kind,
     p_amount_cents,p_effective_date,btrim(p_description),'original')
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.finance_record_entry(uuid,uuid,text,bigint,date,text)
  from public,anon,authenticated;
grant execute on function public.finance_record_entry(uuid,uuid,text,bigint,date,text)
  to authenticated;

create function public.finance_cancel_entry(p_entry_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare
  v_owner uuid := auth.uid();
  v_entry public.finance_ledger_entries%rowtype;
  v_id uuid;
begin
  if v_owner is null or not (select public.finance_is_authorized_owner()) then
    raise exception 'Not an authorized finance owner' using errcode='42501';
  end if;
  select * into v_entry from public.finance_ledger_entries
    where id=p_entry_id and owner_id=v_owner for update;
  if v_entry.id is null or v_entry.entry_role='reversal' or
    exists (select 1 from public.finance_ledger_entries where reverses_entry_id=v_entry.id) then
    raise exception 'Entry unavailable or already reversed' using errcode='22023';
  end if;
  insert into public.finance_ledger_entries
    (owner_id,space_id,account_id,category_id,kind,amount_cents,
     effective_date,description,entry_role,reverses_entry_id)
  values
    (v_owner,v_entry.space_id,v_entry.account_id,v_entry.category_id,v_entry.kind,
     v_entry.amount_cents,v_entry.effective_date,v_entry.description,'reversal',v_entry.id)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.finance_cancel_entry(uuid) from public,anon,authenticated;
grant execute on function public.finance_cancel_entry(uuid) to authenticated;

-- Atomic correction: an offsetting reversal and a fresh replacement, preserving
-- the original record. A failed category/date check rolls back the entire RPC.
create function public.finance_correct_entry(
  p_entry_id uuid,p_category_id uuid,p_amount_cents bigint,
  p_effective_date date,p_description text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
  v_owner uuid := auth.uid();
  v_old public.finance_ledger_entries%rowtype;
  v_account public.finance_accounts%rowtype;
  v_category public.finance_categories%rowtype;
  v_id uuid;
begin
  if v_owner is null or not (select public.finance_is_authorized_owner()) then
    raise exception 'Not an authorized finance owner' using errcode='42501';
  end if;
  select * into v_old from public.finance_ledger_entries
    where id=p_entry_id and owner_id=v_owner for update;
  if v_old.id is null or v_old.entry_role='reversal'
     or exists (select 1 from public.finance_ledger_entries where reverses_entry_id=v_old.id) then
    raise exception 'Entry unavailable or already reversed' using errcode='22023';
  end if;
  if p_amount_cents is null or p_amount_cents not between 1 and 9000000000000000
     or p_effective_date is null or p_effective_date > current_date
     or p_description is null or char_length(btrim(p_description)) not between 1 and 240 then
    raise exception 'Invalid correction parameters' using errcode='22023';
  end if;
  select * into v_account from public.finance_accounts
    where id=v_old.account_id and owner_id=v_owner for share;
  if v_account.id is null or v_account.archived_at is not null
     or p_effective_date < v_account.opening_balance_date then
    raise exception 'Account unavailable or before reference date' using errcode='42501';
  end if;
  select * into v_category from public.finance_categories
    where id=p_category_id and owner_id=v_owner
      and space_id=v_old.space_id and kind=v_old.kind for share;
  if v_category.id is null or v_category.archived_at is not null then
    raise exception 'Category unavailable for account space and type' using errcode='42501';
  end if;
  insert into public.finance_ledger_entries
    (owner_id,space_id,account_id,category_id,kind,amount_cents,effective_date,
     description,entry_role,reverses_entry_id)
  values
    (v_owner,v_old.space_id,v_old.account_id,v_old.category_id,v_old.kind,
     v_old.amount_cents,v_old.effective_date,v_old.description,'reversal',v_old.id);
  insert into public.finance_ledger_entries
    (owner_id,space_id,account_id,category_id,kind,amount_cents,effective_date,
     description,entry_role,corrects_entry_id)
  values
    (v_owner,v_old.space_id,v_old.account_id,p_category_id,v_old.kind,
     p_amount_cents,p_effective_date,btrim(p_description),'replacement',v_old.id)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.finance_correct_entry(uuid,uuid,bigint,date,text)
  from public,anon,authenticated;
grant execute on function public.finance_correct_entry(uuid,uuid,bigint,date,text)
  to authenticated;

-- Ledger is exclusively confirmed actuals; projections and transfers stay apart.
create view public.finance_ledger_legs with (security_invoker=true) as
select l.id as entry_id,l.owner_id,l.space_id,l.account_id,l.effective_date,l.entry_role,
  (case when (l.kind='income') <> (l.entry_role='reversal')
     then l.amount_cents::numeric else -l.amount_cents::numeric end)::text as signed_amount_cents
from public.finance_ledger_entries l;
revoke all on public.finance_ledger_legs from public,anon,authenticated;
grant select on public.finance_ledger_legs to authenticated;

-- Preserve M01's public view columns and their types while adding M02 actuals.
create or replace view public.finance_account_balances with (security_invoker=true) as
select a.id as account_id,a.owner_id,a.space_id,a.account_type,a.name,
       a.currency,a.opening_balance_date,a.opening_balance_cents,a.archived_at,
       (a.opening_balance_cents::numeric
        +coalesce((select sum(l.signed_amount_cents)
                   from public.finance_transfer_legs l where l.account_id=a.id),0::numeric)
        +coalesce((select sum(l.signed_amount_cents::numeric)
                   from public.finance_ledger_legs l where l.account_id=a.id),0::numeric)
       )::text as current_balance_cents
from public.finance_accounts a;
revoke all on public.finance_account_balances from public,anon,authenticated;
grant select on public.finance_account_balances to authenticated;
