-- M01 accounts and INTERNAL bookkeeping transfers; never initiates any bank/card payment.
-- The M00 private singleton owner gate is mandatory for all reads and mutations.
alter table public.finance_spaces
  add constraint finance_spaces_id_owner_unique unique (id, owner_id);

create table public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  space_id uuid not null,
  account_type text not null check (account_type in ('bank', 'cash', 'card')),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  currency text not null default 'BRL' check (currency = 'BRL'),
  opening_balance_cents bigint not null default 0
    check (opening_balance_cents between -9000000000000000 and 9000000000000000),
  opening_balance_date date not null default current_date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint finance_accounts_space_owner_fk
    foreign key (space_id, owner_id) references public.finance_spaces (id, owner_id)
    on delete restrict,
  constraint finance_accounts_id_owner_unique unique (id, owner_id)
);

create index finance_accounts_owner_space_idx on public.finance_accounts (owner_id, space_id);

-- Transfers are bookkeeping records, immutable and createable only by a checked RPC.
create table public.finance_transfers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  from_account_id uuid not null,
  to_account_id uuid not null,
  amount_cents bigint not null check (amount_cents between 1 and 9000000000000000),
  effective_date date not null,
  created_at timestamptz not null default now(),
  constraint finance_transfers_distinct_accounts check (from_account_id <> to_account_id),
  constraint finance_transfers_from_owner_fk
    foreign key (from_account_id, owner_id) references public.finance_accounts (id, owner_id)
    on delete restrict,
  constraint finance_transfers_to_owner_fk
    foreign key (to_account_id, owner_id) references public.finance_accounts (id, owner_id)
    on delete restrict
);
create index finance_transfers_owner_date_idx on public.finance_transfers (owner_id, effective_date);
create index finance_transfers_from_idx on public.finance_transfers (from_account_id);
create index finance_transfers_to_idx on public.finance_transfers (to_account_id);

-- Owner and space identifiers cannot be changed by a client after account creation.
-- A reference balance/date cannot be rewritten after transfers have been recorded.
create function public.finance_account_prevent_reparent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.space_id is distinct from old.space_id
     or new.currency is distinct from old.currency then
    raise exception 'Account identity, owner, space and currency are immutable' using errcode = '23514';
  end if;
  if (new.opening_balance_cents is distinct from old.opening_balance_cents
      or new.opening_balance_date is distinct from old.opening_balance_date)
     and exists (
       select 1 from public.finance_transfers
        where from_account_id = old.id or to_account_id = old.id
     ) then
    raise exception 'Account reference balance is frozen after an internal transfer' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger finance_accounts_guard_update
before update on public.finance_accounts
for each row execute function public.finance_account_prevent_reparent();

alter table public.finance_accounts enable row level security;
alter table public.finance_accounts force row level security;
alter table public.finance_transfers enable row level security;
alter table public.finance_transfers force row level security;

revoke all on public.finance_accounts from public, anon, authenticated;
revoke all on public.finance_transfers from public, anon, authenticated;
grant select, insert, update on public.finance_accounts to authenticated;
grant select on public.finance_transfers to authenticated;

create policy finance_accounts_select_owner on public.finance_accounts
  for select to authenticated
  using ((select auth.uid()) = owner_id and (select public.finance_is_authorized_owner()));
create policy finance_accounts_insert_owner on public.finance_accounts
  for insert to authenticated
  with check ((select auth.uid()) = owner_id and (select public.finance_is_authorized_owner()));
create policy finance_accounts_update_owner on public.finance_accounts
  for update to authenticated
  using ((select auth.uid()) = owner_id and (select public.finance_is_authorized_owner()))
  with check ((select auth.uid()) = owner_id and (select public.finance_is_authorized_owner()));
create policy finance_transfers_select_owner on public.finance_transfers
  for select to authenticated
  using ((select auth.uid()) = owner_id and (select public.finance_is_authorized_owner()));

-- The SECURITY DEFINER routine validates the JWT owner and both account relations.
-- No arbitrary owner_id can be passed by callers, no direct INSERT grant exists.
create function public.finance_record_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount_cents bigint,
  p_effective_date date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid := auth.uid();
  v_source public.finance_accounts%rowtype;
  v_target public.finance_accounts%rowtype;
  v_transfer_id uuid;
begin
  if v_owner is null or not (select public.finance_is_authorized_owner()) then
    raise exception 'Not an authorized finance owner' using errcode = '42501';
  end if;
  if p_from_account_id is null or p_to_account_id is null
     or p_from_account_id = p_to_account_id
     or p_amount_cents is null or p_amount_cents < 1 or p_amount_cents > 9000000000000000
     or p_effective_date is null or p_effective_date > current_date then
    raise exception 'Invalid internal transfer parameters' using errcode = '22023';
  end if;
  select * into v_source from public.finance_accounts
    where id = p_from_account_id and owner_id = v_owner
    for share;
  select * into v_target from public.finance_accounts
    where id = p_to_account_id and owner_id = v_owner
    for share;
  if v_source.id is null or v_target.id is null
     or v_source.archived_at is not null or v_target.archived_at is not null then
    raise exception 'Transfer accounts unavailable or archived' using errcode = '42501';
  end if;
  if p_effective_date < v_source.opening_balance_date
     or p_effective_date < v_target.opening_balance_date then
    raise exception 'Transfer predates an account reference balance' using errcode = '22023';
  end if;
  insert into public.finance_transfers
    (owner_id, from_account_id, to_account_id, amount_cents, effective_date)
    values (v_owner, p_from_account_id, p_to_account_id, p_amount_cents, p_effective_date)
    returning id into v_transfer_id;
  return v_transfer_id;
end;
$$;
revoke all on function public.finance_record_transfer(uuid, uuid, bigint, date) from public, anon, authenticated;
grant execute on function public.finance_record_transfer(uuid, uuid, bigint, date) to authenticated;

-- SECURITY INVOKER is critical; otherwise a view could bypass the underlying RLS.
create view public.finance_transfer_legs with (security_invoker = true) as
  select t.id as transfer_id, t.owner_id, t.from_account_id as account_id,
         -t.amount_cents::numeric as signed_amount_cents, t.effective_date
    from public.finance_transfers t
  union all
  select t.id, t.owner_id, t.to_account_id,
         t.amount_cents::numeric, t.effective_date
    from public.finance_transfers t;

create view public.finance_account_balances with (security_invoker = true) as
select a.id as account_id, a.owner_id, a.space_id, a.account_type, a.name,
       a.currency, a.opening_balance_date, a.opening_balance_cents,
       a.archived_at,
       (a.opening_balance_cents::numeric +
        coalesce((select sum(l.signed_amount_cents)
                   from public.finance_transfer_legs l where l.account_id = a.id), 0::numeric)
       ) as current_balance_cents
  from public.finance_accounts a;

revoke all on public.finance_transfer_legs, public.finance_account_balances from public, anon, authenticated;
grant select on public.finance_transfer_legs, public.finance_account_balances to authenticated;
