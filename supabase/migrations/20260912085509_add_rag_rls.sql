-- Enable Row Level Security
alter table public.rag_documents enable row level security;
alter table public.rag_chunks enable row level security;


-- =========================================================
-- RAG DOCUMENTS
-- =========================================================

-- Organization members can read organization-owned documents.
create policy "Organization members can read organization RAG documents"
on public.rag_documents
for select
to authenticated
using (
  organization_id is not null
  and is_org_member(organization_id)
);


-- Users can read their own personal documents.
create policy "Users can read their own personal RAG documents"
on public.rag_documents
for select
to authenticated
using (
  profile_id = auth.uid()
);


-- Organization members can insert organization-owned documents.
create policy "Organization members can insert organization RAG documents"
on public.rag_documents
for insert
to authenticated
with check (
  organization_id is not null
  and is_org_member(organization_id)
);


-- Users can insert their own personal documents.
create policy "Users can insert their own personal RAG documents"
on public.rag_documents
for insert
to authenticated
with check (
  profile_id = auth.uid()
);


-- Organization members can update organization-owned documents.
create policy "Organization members can update organization RAG documents"
on public.rag_documents
for update
to authenticated
using (
  organization_id is not null
  and is_org_member(organization_id)
)
with check (
  organization_id is not null
  and is_org_member(organization_id)
);


-- Users can update their own personal documents.
create policy "Users can update their own personal RAG documents"
on public.rag_documents
for update
to authenticated
using (
  profile_id = auth.uid()
)
with check (
  profile_id = auth.uid()
);


-- Organization members can delete organization-owned documents.
create policy "Organization members can delete organization RAG documents"
on public.rag_documents
for delete
to authenticated
using (
  organization_id is not null
  and is_org_member(organization_id)
);


-- Users can delete their own personal documents.
create policy "Users can delete their own personal RAG documents"
on public.rag_documents
for delete
to authenticated
using (
  profile_id = auth.uid()
);


-- =========================================================
-- RAG CHUNKS
-- =========================================================

-- Users can read chunks belonging to documents they can access.
create policy "Users can read accessible RAG chunks"
on public.rag_chunks
for select
to authenticated
using (
  exists (
    select 1
    from public.rag_documents rd
    where rd.id = rag_chunks.document_id
      and (
        (
          rd.organization_id is not null
          and is_org_member(rd.organization_id)
        )
        or rd.profile_id = auth.uid()
      )
  )
);


-- Users can insert chunks only into documents they can access.
create policy "Users can insert accessible RAG chunks"
on public.rag_chunks
for insert
to authenticated
with check (
  exists (
    select 1
    from public.rag_documents rd
    where rd.id = rag_chunks.document_id
      and (
        (
          rd.organization_id is not null
          and is_org_member(rd.organization_id)
        )
        or rd.profile_id = auth.uid()
      )
  )
);


-- Users can update chunks only in documents they can access.
create policy "Users can update accessible RAG chunks"
on public.rag_chunks
for update
to authenticated
using (
  exists (
    select 1
    from public.rag_documents rd
    where rd.id = rag_chunks.document_id
      and (
        (
          rd.organization_id is not null
          and is_org_member(rd.organization_id)
        )
        or rd.profile_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1
    from public.rag_documents rd
    where rd.id = rag_chunks.document_id
      and (
        (
          rd.organization_id is not null
          and is_org_member(rd.organization_id)
        )
        or rd.profile_id = auth.uid()
      )
  )
);


-- Users can delete chunks only from documents they can access.
create policy "Users can delete accessible RAG chunks"
on public.rag_chunks
for delete
to authenticated
using (
  exists (
    select 1
    from public.rag_documents rd
    where rd.id = rag_chunks.document_id
      and (
        (
          rd.organization_id is not null
          and is_org_member(rd.organization_id)
        )
        or rd.profile_id = auth.uid()
      )
  )
);