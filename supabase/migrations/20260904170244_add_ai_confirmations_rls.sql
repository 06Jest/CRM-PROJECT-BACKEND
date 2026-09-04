alter table public.ai_confirmations enable row level security;

create policy "Users can view their own AI confirmations"
on public.ai_confirmations
for select
to authenticated
using (
  profile_id = auth.uid()
);

create policy "Users can create their own AI confirmations"
on public.ai_confirmations
for insert
to authenticated
with check (
  profile_id = auth.uid()
);

create policy "Users can delete their own AI confirmations"
on public.ai_confirmations
for delete
to authenticated
using (
  profile_id = auth.uid()
);