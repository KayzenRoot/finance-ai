-- Local-only synthetic identity used by the CI backup and restore rehearsal.
insert into auth.users (id)
values ('90000000-0000-4000-8000-000000000009')
on conflict (id) do nothing;
