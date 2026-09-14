create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),

  -- Anonymous visitor identity
  visitor_id uuid null,

  -- Authenticated profile identity
  profile_id uuid null references public.profiles (id) on delete cascade,

  -- Number of prompts consumed in the current quota window
  prompts_used integer not null default 0,

  -- Quota window
  window_started_at timestamptz not null default now(),
  window_expires_at timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_usage_identity_check
    check (visitor_id is not null or profile_id is not null),

  constraint ai_usage_prompts_check
    check (prompts_used >= 0)
);

-- Only one usage record per anonymous visitor
create unique index ai_usage_visitor_unique
on public.ai_usage (visitor_id)
where visitor_id is not null;

-- Only one usage record per authenticated profile
create unique index ai_usage_profile_unique
on public.ai_usage (profile_id)
where profile_id is not null;