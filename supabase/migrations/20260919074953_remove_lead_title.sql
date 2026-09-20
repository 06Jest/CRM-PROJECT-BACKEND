alter table public.leads
drop constraint if exists leads_title_length_check;

alter table public.leads
drop column if exists title;