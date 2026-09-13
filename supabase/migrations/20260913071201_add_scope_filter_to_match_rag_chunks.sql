/*
  Update RAG vector search to support:
  - platform scope
  - organization scope
  - profile scope
*/

drop function if exists public.match_rag_chunks(
  extensions.vector,
  integer,
  uuid,
  uuid
);

create or replace function public.match_rag_chunks(
  query_embedding extensions.vector,
  match_count integer default 5,
  filter_scope_type text default null,
  filter_organization_id uuid default null,
  filter_profile_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index integer,
  metadata jsonb,
  similarity double precision
)
language sql
stable
set search_path to ''
as $function$
  select
    c.id,
    c.document_id,
    c.content,
    c.chunk_index,
    c.metadata,
    1 - (
      c.embedding operator(extensions.<=>) query_embedding
    ) as similarity
  from public.rag_chunks as c
  inner join public.rag_documents as d
    on d.id = c.document_id
  where
    (
      filter_scope_type is null
      or d.scope_type = filter_scope_type
    )
    and (
      filter_organization_id is null
      or d.organization_id = filter_organization_id
    )
    and (
      filter_profile_id is null
      or d.profile_id = filter_profile_id
    )
  order by c.embedding operator(extensions.<=>) query_embedding
  limit least(greatest(match_count, 1), 50);
$function$;