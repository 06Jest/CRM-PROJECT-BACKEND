-- Stores original knowledge sources used by RAG.
create table public.rag_documents (
  id uuid primary key default gen_random_uuid(),

  source_id text not null,
  source_type text not null,
  source_name text,

  organization_id uuid references public.organizations(id)
    on delete cascade,

  profile_id uuid references public.profiles(id)
    on delete cascade,

  title text,

  metadata jsonb not null default '{}'::jsonb,

  source_updated_at timestamptz,
  indexed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint rag_documents_has_owner
    check (
      organization_id is not null
      or profile_id is not null
    ),

  constraint rag_documents_has_single_owner
    check (
      not (
        organization_id is not null
        and profile_id is not null
      )
    )
);

-- Stores searchable text chunks and their embeddings.
create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),

  document_id uuid not null
    references public.rag_documents(id)
    on delete cascade,

  content text not null,
  chunk_index integer not null,

  embedding_provider text not null default 'cloudflare',
  embedding_model text not null default '@cf/baai/bge-small-en-v1.5',

  embedding extensions.vector(384),

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint rag_chunks_chunk_index_nonnegative
    check (chunk_index >= 0),

  constraint rag_chunks_content_not_empty
    check (length(trim(content)) > 0),

  unique (document_id, chunk_index)
);

create index rag_documents_organization_id_idx
  on public.rag_documents (organization_id)
  where organization_id is not null;

create index rag_documents_profile_id_idx
  on public.rag_documents (profile_id)
  where profile_id is not null;

create index rag_chunks_document_id_idx
  on public.rag_chunks (document_id);