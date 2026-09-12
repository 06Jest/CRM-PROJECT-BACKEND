-- Enable Row Level Security
alter table public.personal_record_counters
enable row level security;


-- Users can view their own personal record counters.
create policy "Users can view own personal record counters"
on public.personal_record_counters
for select
to authenticated
using (
  profile_id = auth.uid()
);


-- Users can create their own personal record counters.
create policy "Users can create own personal record counters"
on public.personal_record_counters
for insert
to authenticated
with check (
  profile_id = auth.uid()
);


-- Users can update their own personal record counters.
create policy "Users can update own personal record counters"
on public.personal_record_counters
for update
to authenticated
using (
  profile_id = auth.uid()
)
with check (
  profile_id = auth.uid()
);


-- Users can delete their own personal record counters.
create policy "Users can delete own personal record counters"
on public.personal_record_counters
for delete
to authenticated
using (
  profile_id = auth.uid()
);