/*
  Add explicit scope support to RAG documents.

  Supported scopes:
  - platform: no organization or profile owner
  - organization: requires organization_id
  - profile: requires profile_id
*/

-- =========================================================
-- 1. Add scope_type as nullable initially
-- =========================================================

alter table public.rag_documents
add column if not exists scope_type text;

-- =========================================================
-- 2. Backfill existing documents based on their current owner
-- =========================================================

update public.rag_documents
set scope_type = case
  when organization_id is not null
    and profile_id is null
    then 'organization'

  when organization_id is null
    and profile_id is not null
    then 'profile'

  when organization_id is null
    and profile_id is null
    then 'platform'

  else null
end
where scope_type is null;

-- =========================================================
-- 3. Fail the migration if existing rows have invalid ownership
-- =========================================================

do $$
begin
  if exists (
    select 1
    from public.rag_documents
    where scope_type is null
  ) then
    raise exception
      'Cannot assign scope_type: one or more rag_documents rows have invalid ownership. Each row must have either organization_id, profile_id, or neither, but never both.';
  end if;
end
$$;

-- =========================================================
-- 4. Make scope_type required and restrict its values
-- =========================================================

alter table public.rag_documents
alter column scope_type set not null;

alter table public.rag_documents
add constraint rag_documents_scope_type_check
check (
  scope_type in ('platform', 'organization', 'profile')
);

-- =========================================================
-- 5. Remove the old ownership constraints
-- =========================================================

alter table public.rag_documents
drop constraint if exists rag_documents_has_owner;

alter table public.rag_documents
drop constraint if exists rag_documents_has_single_owner;

-- =========================================================
-- 6. Add scope-aware ownership validation
-- =========================================================

alter table public.rag_documents
add constraint rag_documents_scope_owner_check
check (
  (
    scope_type = 'platform'
    and organization_id is null
    and profile_id is null
  )
  or
  (
    scope_type = 'organization'
    and organization_id is not null
    and profile_id is null
  )
  or
  (
    scope_type = 'profile'
    and profile_id is not null
    and organization_id is null
  )
);

-- =========================================================
-- 7. Replace the old unique indexes
-- =========================================================

drop index if exists public.rag_documents_unique_organization_source_idx;

drop index if exists public.rag_documents_unique_profile_source_idx;

create unique index if not exists
  rag_documents_unique_organization_source_idx
on public.rag_documents (
  organization_id,
  source_type,
  source_id
)
where scope_type = 'organization';

create unique index if not exists
  rag_documents_unique_profile_source_idx
on public.rag_documents (
  profile_id,
  source_type,
  source_id
)
where scope_type = 'profile';

create unique index if not exists
  rag_documents_unique_platform_source_idx
on public.rag_documents (
  source_type,
  source_id
)
where scope_type = 'platform';