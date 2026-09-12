-- Prevent duplicate organization-owned RAG documents.
create unique index rag_documents_unique_organization_source_idx
on public.rag_documents (
  organization_id,
  source_type,
  source_id
)
where organization_id is not null;

-- Prevent duplicate profile-owned RAG documents.
create unique index rag_documents_unique_profile_source_idx
on public.rag_documents (
  profile_id,
  source_type,
  source_id
)
where profile_id is not null;