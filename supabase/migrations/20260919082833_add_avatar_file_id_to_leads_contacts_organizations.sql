alter table public.leads
add column if not exists avatar_file_id uuid;

alter table public.contacts
add column if not exists avatar_file_id uuid;

alter table public.organizations
add column if not exists avatar_file_id uuid;