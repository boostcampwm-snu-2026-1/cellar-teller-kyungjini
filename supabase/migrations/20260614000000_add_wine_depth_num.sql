alter table public.wines
add column if not exists depth_num int default 1 check (depth_num >= 1 and depth_num <= 3);
