create table if not exists public.wines (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  name text not null,
  producer text,
  vintage int,
  type text default 'Red',
  grape_variety text,
  region text,
  purchase_date date,
  purchase_price numeric,
  is_cellar boolean default false,
  cellar_zone text,
  row_num int,
  col_num int,
  is_consumed boolean default false,
  drinking_date date,
  label_image_url text,
  tasting_notes text,
  rating int check (rating >= 1 and rating <= 5)
);

alter table public.wines enable row level security;

drop policy if exists "Allow public read and write access" on public.wines;

create policy "Allow public read and write access"
on public.wines
for all
using (true)
with check (true);
