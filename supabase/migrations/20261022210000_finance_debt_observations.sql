-- FAI-M04: debt register and append-only snapshots. Synthetic CI data only.
-- Missing financing terms must stay NULL; no inferred APR, CET or penalties.
create table public.finance_debts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  creditor text not null check (char_length(btrim(creditor)) between 1 and 180),
  created_at timestamptz not null default now(),
  constraint finance_debts_space_owner_fk foreign key (space_id,owner_id)
    references public.finance_spaces(id,owner_id) on delete restrict,
  constraint finance_debts_identity_unique unique (id,owner_id,space_id)
);
create index finance_debts_owner_space_idx on public.finance_debts(owner_id,space_id);

create table public.finance_debt_observations (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null,
  balance_cents bigint check (balance_cents >= 0 and balance_cents <= 9000000000000000),
  minimum_due_cents bigint check (minimum_due_cents >= 0 and minimum_due_cents <= 9000000000000000),
  due_date date,
  interest_percent numeric(14,8) check (interest_percent between 0 and 10000),
  interest_period text,
  interest_source text,
  cet_percent numeric(14,8) check (cet_percent between 0 and 10000),
  cet_period text,
  cet_source text,
  penalty_fixed_cents bigint check (penalty_fixed_cents >= 0 and penalty_fixed_cents <= 9000000000000000),
  consequences text check (char_length(consequences) <= 1200),
  source_reference text not null check (char_length(btrim(source_reference)) between 1 and 240),
  as_of_date date not null check (as_of_date <= current_date),
  recorded_at timestamptz not null default now(),
  constraint finance_observations_debt_fk foreign key (debt_id,owner_id,space_id)
    references public.finance_debts(id,owner_id,space_id) on delete restrict,
  constraint finance_observations_interest_shape check (
    (interest_percent is null and interest_period is null and interest_source is null)
    or (interest_percent is not null and interest_period in ('daily','monthly','annual')
      and char_length(btrim(interest_source)) between 1 and 240)
  ),
  constraint finance_observations_cet_shape check (
    (cet_percent is null and cet_period is null and cet_source is null)
    or (cet_percent is not null and cet_period in ('daily','monthly','annual')
      and char_length(btrim(cet_source)) between 1 and 240)
  )
);
create index finance_debt_observations_history_idx
  on public.finance_debt_observations(debt_id,as_of_date desc,recorded_at desc,id desc);
create index finance_debt_observations_owner_idx
  on public.finance_debt_observations(owner_id,space_id);
alter table public.finance_debts enable row level security;
alter table public.finance_debts force row level security;
alter table public.finance_debt_observations enable row level security;
alter table public.finance_debt_observations force row level security;
revoke all on public.finance_debts,public.finance_debt_observations
  from public,anon,authenticated;
grant select on public.finance_debts,public.finance_debt_observations to authenticated;
create policy finance_debts_owner_select on public.finance_debts
  for select to authenticated using (
    owner_id=(select auth.uid()) and (select public.finance_is_authorized_owner())
  );
create policy finance_debt_observations_owner_select on public.finance_debt_observations
  for select to authenticated using (
    owner_id=(select auth.uid()) and (select public.finance_is_authorized_owner())
  );

-- All mutations use authenticated, space-checked RPCs. No direct table writes.
create function public.finance_create_debt(p_space_id uuid,p_creditor text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_id uuid;
begin
 if v_owner is null or not (select public.finance_is_authorized_owner()) then
   raise exception 'Not an authorized finance owner' using errcode='42501';
 end if;
 if p_creditor is null or char_length(btrim(p_creditor)) not between 1 and 180 then
   raise exception 'Invalid creditor' using errcode='22023';
 end if;
 if not exists (select 1 from public.finance_spaces
                where id=p_space_id and owner_id=v_owner) then
   raise exception 'Debt space unavailable' using errcode='42501';
 end if;
 insert into public.finance_debts(owner_id,space_id,creditor)
 values(v_owner,p_space_id,btrim(p_creditor)) returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.finance_create_debt(uuid,text) from public,anon,authenticated;
grant execute on function public.finance_create_debt(uuid,text) to authenticated;

create function public.finance_record_debt_observation(
 p_debt_id uuid,
 p_source_reference text,
 p_as_of_date date,
 p_balance_cents bigint default null,
 p_minimum_due_cents bigint default null,
 p_due_date date default null,
 p_interest_percent numeric default null,
 p_interest_period text default null,
 p_interest_source text default null,
 p_cet_percent numeric default null,
 p_cet_period text default null,
 p_cet_source text default null,
 p_penalty_fixed_cents bigint default null,
 p_consequences text default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_debt public.finance_debts%rowtype;v_id uuid;
begin
 if v_owner is null or not (select public.finance_is_authorized_owner()) then
   raise exception 'Not an authorized finance owner' using errcode='42501';
 end if;
 select * into v_debt from public.finance_debts
  where id=p_debt_id and owner_id=v_owner for share;
 if v_debt.id is null then
   raise exception 'Debt unavailable' using errcode='42501';
 end if;
 if p_source_reference is null or char_length(btrim(p_source_reference)) not between 1 and 240
    or p_as_of_date is null or p_as_of_date>current_date
    or (p_balance_cents is not null and p_balance_cents not between 0 and 9000000000000000)
    or (p_minimum_due_cents is not null and p_minimum_due_cents not between 0 and 9000000000000000)
    or (p_penalty_fixed_cents is not null and p_penalty_fixed_cents not between 0 and 9000000000000000)
    or (p_consequences is not null and char_length(p_consequences)>1200)
    or ((p_interest_percent is null) <> (p_interest_period is null))
    or ((p_interest_percent is null) <> (p_interest_source is null))
    or (p_interest_percent is not null and
       (p_interest_percent not between 0 and 10000
        or p_interest_period not in ('daily','monthly','annual')
        or char_length(btrim(p_interest_source)) not between 1 and 240))
    or ((p_cet_percent is null) <> (p_cet_period is null))
    or ((p_cet_percent is null) <> (p_cet_source is null))
    or (p_cet_percent is not null and
       (p_cet_percent not between 0 and 10000
        or p_cet_period not in ('daily','monthly','annual')
        or char_length(btrim(p_cet_source)) not between 1 and 240)) then
   raise exception 'Invalid debt observation or missing rate provenance'
     using errcode='22023';
 end if;
 insert into public.finance_debt_observations(
  debt_id,owner_id,space_id,balance_cents,minimum_due_cents,due_date,
  interest_percent,interest_period,interest_source,cet_percent,cet_period,cet_source,
  penalty_fixed_cents,consequences,source_reference,as_of_date)
 values(
  p_debt_id,v_owner,v_debt.space_id,p_balance_cents,p_minimum_due_cents,p_due_date,
  p_interest_percent,p_interest_period,btrim(p_interest_source),
  p_cet_percent,p_cet_period,btrim(p_cet_source),
  p_penalty_fixed_cents,p_consequences,btrim(p_source_reference),p_as_of_date)
 returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.finance_record_debt_observation(
 uuid,text,date,bigint,bigint,date,numeric,text,text,numeric,text,text,bigint,text
) from public,anon,authenticated;
grant execute on function public.finance_record_debt_observation(
 uuid,text,date,bigint,bigint,date,numeric,text,text,numeric,text,text,bigint,text
) to authenticated;

-- The most recent observation wins. A late-recorded historical source can
-- be attached without replacing a newer as-of snapshot.
create view public.finance_debt_latest with (security_invoker=true) as
 select d.id,d.owner_id,d.space_id,d.creditor,d.created_at,
        obs.id as observation_id,obs.balance_cents::text as balance_cents,
        obs.minimum_due_cents::text as minimum_due_cents,obs.due_date,
        obs.interest_percent::text as interest_percent,obs.interest_period,obs.interest_source,
        obs.cet_percent::text as cet_percent,obs.cet_period,obs.cet_source,
        obs.penalty_fixed_cents::text as penalty_fixed_cents,
        obs.consequences,obs.source_reference,obs.as_of_date,obs.recorded_at,
        (obs.id is null or obs.balance_cents is null or obs.minimum_due_cents is null
          or obs.due_date is null or obs.interest_percent is null or
             obs.cet_percent is null or obs.penalty_fixed_cents is null) as has_missing_cost_data
 from public.finance_debts d
 left join lateral (
   select o.* from public.finance_debt_observations o
   where o.debt_id=d.id
   order by o.as_of_date desc,o.recorded_at desc,o.id desc limit 1
 ) obs on true;
revoke all on public.finance_debt_latest from public,anon,authenticated;
grant select on public.finance_debt_latest to authenticated;
