alter table public.tasks add column sort_order text;
alter table public.tasks alter column sort_order type text collate "C";
