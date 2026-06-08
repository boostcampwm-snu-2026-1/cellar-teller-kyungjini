create extension if not exists pgcrypto;

create table if not exists public.wines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  producer text,
  vintage integer check (vintage is null or (vintage >= 1800 and vintage <= 2200)),
  variety text,
  price numeric(10, 2) check (price is null or price >= 0),
  purchase_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wines_owner_created_at_idx
  on public.wines (owner_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_wines_updated_at on public.wines;

create trigger set_wines_updated_at
before update on public.wines
for each row
execute function public.set_updated_at();

alter table public.wines enable row level security;

drop policy if exists "wines_select_own_rows" on public.wines;
drop policy if exists "wines_insert_own_rows" on public.wines;
drop policy if exists "wines_update_own_rows" on public.wines;
drop policy if exists "wines_delete_own_rows" on public.wines;

create policy "wines_select_own_rows"
on public.wines
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "wines_insert_own_rows"
on public.wines
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "wines_update_own_rows"
on public.wines
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "wines_delete_own_rows"
on public.wines
for delete
to authenticated
using ((select auth.uid()) = owner_id);
