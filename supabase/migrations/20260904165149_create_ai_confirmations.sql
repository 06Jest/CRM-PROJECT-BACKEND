create table public.ai_confirmations (
  id uuid not null default gen_random_uuid(),

  profile_id uuid not null,
  org_id uuid null,
  conversation_id uuid null,
  agent_id text not null,

  tool_name text not null,
  tool_call_id text not null,
  tool_arguments jsonb not null,

  expires_at timestamp with time zone not null,

  created_at timestamp with time zone not null default now(),

  constraint ai_confirmations_pkey
    primary key (id),

  constraint ai_confirmations_profile_id_fkey
    foreign key (profile_id)
    references profiles (id)
    on delete cascade,

  constraint ai_confirmations_org_id_fkey
    foreign key (org_id)
    references organizations (id)
    on delete cascade,

  constraint ai_confirmations_conversation_id_fkey
    foreign key (conversation_id)
    references ai_conversations (id)
    on delete cascade
);

create index if not exists ai_confirmations_profile_id_idx
  on public.ai_confirmations using btree (profile_id);

create index if not exists ai_confirmations_org_id_idx
  on public.ai_confirmations using btree (org_id);

create index if not exists ai_confirmations_conversation_id_idx
  on public.ai_confirmations using btree (conversation_id);

create index if not exists ai_confirmations_expires_at_idx
  on public.ai_confirmations using btree (expires_at);