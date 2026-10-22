-- FAI-M03: forecast-only commitments, idempotent recurring plans and atomic ledger settlement.
-- No banking/payment initiation, only manual confirmation and synthetic tests.
create table public.finance_recurring_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  kind text not null check (kind in ('payable','receivable')),
  description text not null check (char_length(btrim(description)) between 1 and 240),
  amount_cents bigint not null check (amount_cents between 1 and 9000000000000000),
  first_due_date date not null,
  frequency text not null check (frequency in ('weekly','monthly')),
  confidence_percent integer not null default 100
    check (confidence_percent between 0 and 100),
  created_at timestamptz not null default now(),
  constraint finance_plans_owner_space_fk foreign key (space_id,owner_id)
    references public.finance_spaces(id,owner_id) on delete restrict,
  constraint finance_plans_payable_confidence check (kind='receivable' or confidence_percent=100),
  constraint finance_plans_identity_unique unique(id,owner_id,space_id,kind)
);
create index finance_recurring_plans_owner_idx on public.finance_recurring_plans(owner_id,space_id);

create table public.finance_commitments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  kind text not null check (kind in ('payable','receivable')),
  description text not null check (char_length(btrim(description)) between 1 and 240),
  amount_cents bigint not null check (amount_cents between 1 and 9000000000000000),
  due_date date not null,
  confidence_percent integer not null default 100
    check (confidence_percent between 0 and 100),
  status text not null default 'open' check (status in ('open','settled','canceled')),
  series_id uuid,
  created_at timestamptz not null default now(),
  settled_at timestamptz,
  canceled_at timestamptz,
  constraint finance_commitments_owner_space_fk foreign key (space_id,owner_id)
    references public.finance_spaces(id,owner_id) on delete restrict,
  constraint finance_commitments_plan_fk foreign key (series_id,owner_id,space_id,kind)
    references public.finance_recurring_plans(id,owner_id,space_id,kind) on delete restrict,
  constraint finance_commitments_payable_confidence check (kind='receivable' or confidence_percent=100),
  constraint finance_commitments_status_shape check (
    (status='open' and settled_at is null and canceled_at is null)
    or (status='settled' and settled_at is not null and canceled_at is null)
    or (status='canceled' and settled_at is null and canceled_at is not null)
  ),
  constraint finance_commitments_identity_unique unique(id,owner_id,space_id,kind)
);
create unique index finance_commitments_unique_recurrence
  on public.finance_commitments(series_id,due_date) where series_id is not null;
create index finance_commitments_owner_due on public.finance_commitments(owner_id,space_id,status,due_date);

create table public.finance_commitment_settlements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  kind text not null check (kind in ('payable','receivable')),
  commitment_id uuid not null unique,
  ledger_entry_id uuid not null unique references public.finance_ledger_entries(id) on delete restrict,
  settled_at timestamptz not null default now(),
  constraint finance_settlements_commitment_fk foreign key (commitment_id,owner_id,space_id,kind)
    references public.finance_commitments(id,owner_id,space_id,kind) on delete restrict
);
create index finance_commitment_settlements_owner_idx on public.finance_commitment_settlements(owner_id,space_id);

alter table public.finance_recurring_plans enable row level security;
alter table public.finance_recurring_plans force row level security;
alter table public.finance_commitments enable row level security;
alter table public.finance_commitments force row level security;
alter table public.finance_commitment_settlements enable row level security;
alter table public.finance_commitment_settlements force row level security;
revoke all on public.finance_recurring_plans,public.finance_commitments,public.finance_commitment_settlements
  from public,anon,authenticated;
grant select,insert on public.finance_recurring_plans to authenticated;
grant select on public.finance_commitments,public.finance_commitment_settlements to authenticated;

create policy finance_plans_select_owner on public.finance_recurring_plans
 for select to authenticated using
 ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));
create policy finance_plans_insert_owner on public.finance_recurring_plans
 for insert to authenticated with check
 ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));
create policy finance_commitments_select_owner on public.finance_commitments
 for select to authenticated using
 ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));
create policy finance_settlements_select_owner on public.finance_commitment_settlements
 for select to authenticated using
 ((select auth.uid())=owner_id and (select public.finance_is_authorized_owner()));

create function public.finance_create_commitment(
 p_space_id uuid,p_kind text,p_description text,p_amount_cents bigint,
 p_due_date date,p_confidence_percent integer default 100
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_id uuid;
begin
 if v_owner is null or not (select public.finance_is_authorized_owner()) then
   raise exception 'Not an authorized finance owner' using errcode='42501';
 end if;
 if p_kind is null or p_kind not in ('payable','receivable')
   or p_description is null or char_length(btrim(p_description)) not between 1 and 240
   or p_amount_cents is null or p_amount_cents not between 1 and 9000000000000000
   or p_due_date is null or p_confidence_percent is null
   or p_confidence_percent not between 0 and 100
   or (p_kind='payable' and p_confidence_percent<>100) then
   raise exception 'Invalid commitment parameters' using errcode='22023';
 end if;
 if not exists(select 1 from public.finance_spaces where id=p_space_id and owner_id=v_owner) then
   raise exception 'Commitment space unavailable' using errcode='42501';
 end if;
 insert into public.finance_commitments(owner_id,space_id,kind,description,amount_cents,due_date,confidence_percent)
 values(v_owner,p_space_id,p_kind,btrim(p_description),p_amount_cents,p_due_date,p_confidence_percent)
 returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.finance_create_commitment(uuid,text,text,bigint,date,integer)
 from public,anon,authenticated;
grant execute on function public.finance_create_commitment(uuid,text,text,bigint,date,integer) to authenticated;

-- Always compute occurrences from the original anchor, never from last generated.
-- Thus Jan 31 -> Feb 28/29 -> Mar 31; repeated generation is idempotent.
create function public.finance_generate_commitments(p_series_id uuid,p_through_date date)
returns integer language plpgsql security definer set search_path='' as $$
declare
 v_owner uuid:=auth.uid();
 v_plan public.finance_recurring_plans%rowtype;
 v_i integer;
 v_due date;
 v_count integer:=0;
 v_added integer;
begin
 if v_owner is null or not (select public.finance_is_authorized_owner()) then
   raise exception 'Not an authorized finance owner' using errcode='42501';
 end if;
 select * into v_plan from public.finance_recurring_plans
 where id=p_series_id and owner_id=v_owner for share;
 if v_plan.id is null then
   raise exception 'Recurring plan unavailable' using errcode='42501';
 end if;
 if p_through_date is null or p_through_date<v_plan.first_due_date
  or p_through_date>=(v_plan.first_due_date + interval '19 months')::date
  or p_through_date>(current_date + interval '18 months')::date then
   raise exception 'Invalid bounded recurrence horizon' using errcode='22023';
 end if;
 for v_i in 0..79 loop
   if v_plan.frequency='monthly' then
     v_due:=(v_plan.first_due_date + (v_i * interval '1 month'))::date;
   else
     v_due:=v_plan.first_due_date + (v_i * 7);
   end if;
   exit when v_due>p_through_date;
   insert into public.finance_commitments(
      owner_id,space_id,kind,description,amount_cents,due_date,confidence_percent,series_id)
   values(v_owner,v_plan.space_id,v_plan.kind,v_plan.description,v_plan.amount_cents,
          v_due,v_plan.confidence_percent,v_plan.id)
   on conflict (series_id,due_date) where series_id is not null do nothing;
   get diagnostics v_added=row_count;
   v_count:=v_count+v_added;
 end loop;
 return v_count;
end;
$$;
revoke all on function public.finance_generate_commitments(uuid,date) from public,anon,authenticated;
grant execute on function public.finance_generate_commitments(uuid,date) to authenticated;

create function public.finance_cancel_commitment(p_commitment_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_id uuid;
begin
 if v_owner is null or not (select public.finance_is_authorized_owner()) then
   raise exception 'Not an authorized finance owner' using errcode='42501';
 end if;
 update public.finance_commitments set status='canceled',canceled_at=now()
 where id=p_commitment_id and owner_id=v_owner and status='open'
 returning id into v_id;
 if v_id is null then
   raise exception 'Commitment not open or unavailable' using errcode='22023';
 end if;
 return v_id;
end;
$$;
revoke all on function public.finance_cancel_commitment(uuid) from public,anon,authenticated;
grant execute on function public.finance_cancel_commitment(uuid) to authenticated;

-- Confirmed ledger entry and settlement must be one atomic transaction.
create function public.finance_settle_commitment(
 p_commitment_id uuid,p_account_id uuid,p_category_id uuid,p_effective_date date
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_owner uuid:=auth.uid();
 v_commitment public.finance_commitments%rowtype;
 v_account public.finance_accounts%rowtype;
 v_entry uuid;
 v_expected_kind text;
begin
 if v_owner is null or not (select public.finance_is_authorized_owner()) then
   raise exception 'Not an authorized finance owner' using errcode='42501';
 end if;
 select * into v_commitment from public.finance_commitments
 where id=p_commitment_id and owner_id=v_owner for update;
 if v_commitment.id is null or v_commitment.status<>'open' then
   raise exception 'Commitment not open or unavailable' using errcode='22023';
 end if;
 select * into v_account from public.finance_accounts
 where id=p_account_id and owner_id=v_owner and space_id=v_commitment.space_id for share;
 if v_account.id is null or v_account.archived_at is not null then
   raise exception 'Settlement account unavailable in this space' using errcode='42501';
 end if;
 v_expected_kind:=case when v_commitment.kind='payable' then 'expense' else 'income' end;
 -- finance_record_entry independently authorizes category, account, date and exact amount.
 v_entry:=public.finance_record_entry(p_account_id,p_category_id,v_expected_kind,
    v_commitment.amount_cents,p_effective_date,v_commitment.description);
 insert into public.finance_commitment_settlements(
    owner_id,space_id,kind,commitment_id,ledger_entry_id)
 values(v_owner,v_commitment.space_id,v_commitment.kind,v_commitment.id,v_entry);
 update public.finance_commitments set status='settled',settled_at=now()
 where id=v_commitment.id;
 return v_entry;
end;
$$;
revoke all on function public.finance_settle_commitment(uuid,uuid,uuid,date)
 from public,anon,authenticated;
grant execute on function public.finance_settle_commitment(uuid,uuid,uuid,date) to authenticated;

-- Do not allow M02 correction/cancel of a linked settlement entry;
-- otherwise the commitment would stay "settled" without a confirmed ledger entry.
create function public.finance_protect_settlement_ledger()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.entry_role='reversal' and exists(
   select 1 from public.finance_commitment_settlements
   where ledger_entry_id=new.reverses_entry_id
 ) then
   raise exception 'Settled commitment ledger cannot be reversed independently'
     using errcode='23514';
 end if;
 return new;
end;
$$;
create trigger finance_ledger_guard_settlement before insert on public.finance_ledger_entries
for each row execute function public.finance_protect_settlement_ledger();

-- Forecast is only a planning signal. It must not enter finance_account_balances.
create view public.finance_commitment_forecast with (security_invoker=true) as
 select id,owner_id,space_id,kind,description,due_date,amount_cents::text as amount_cents,
        confidence_percent,status,
        (case when kind='payable' then -amount_cents::numeric
         else amount_cents::numeric end)::text as projected_signed_cents
 from public.finance_commitments where status='open';
revoke all on public.finance_commitment_forecast from public,anon,authenticated;
grant select on public.finance_commitment_forecast to authenticated;
