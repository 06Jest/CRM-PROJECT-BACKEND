-- ============================================================
-- AI Conversations RLS
-- ============================================================

-- ------------------------------------------------------------
-- Helper: verify that the authenticated profile is an active
-- member of the requested organization.
--
-- SECURITY DEFINER avoids depending on organization_members'
-- own RLS policies when evaluating AI conversation access.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_active_ai_org_member(
    target_org_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members om
        WHERE om.profile_id = auth.uid()
          AND om.org_id = target_org_id
          AND om.status = 'active'
          AND om.deleted_at IS NULL
    );
$$;


-- ------------------------------------------------------------
-- Enable RLS
-- ------------------------------------------------------------

ALTER TABLE public.ai_conversations
ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- SELECT
--
-- Personal:
--   profile_id = me
--   org_id IS NULL
--
-- Organization:
--   profile_id = me
--   org_id = current JWT organization
--   active membership required
-- ------------------------------------------------------------

CREATE POLICY "Users can view their own AI conversations"
ON public.ai_conversations
FOR SELECT
TO authenticated
USING (
    profile_id = auth.uid()
    AND (
        org_id IS NULL
        OR (
            org_id = (auth.jwt() ->> 'org_id')::uuid
            AND public.is_active_ai_org_member(org_id)
        )
    )
);


-- ------------------------------------------------------------
-- INSERT
--
-- Prevent users from creating a conversation under an
-- organization they don't belong to.
-- ------------------------------------------------------------

CREATE POLICY "Users can create their own AI conversations"
ON public.ai_conversations
FOR INSERT
TO authenticated
WITH CHECK (
    profile_id = auth.uid()
    AND (
        org_id IS NULL
        OR (
            org_id = (auth.jwt() ->> 'org_id')::uuid
            AND public.is_active_ai_org_member(org_id)
        )
    )
);


-- ------------------------------------------------------------
-- UPDATE
--
-- Both the existing row and the new row must be authorized.
--
-- This prevents:
--
-- personal conversation
--       ↓
-- changed into
--       ↓
-- unauthorized organization
-- ------------------------------------------------------------

CREATE POLICY "Users can update their own AI conversations"
ON public.ai_conversations
FOR UPDATE
TO authenticated
USING (
    profile_id = auth.uid()
    AND (
        org_id IS NULL
        OR (
            org_id = (auth.jwt() ->> 'org_id')::uuid
            AND public.is_active_ai_org_member(org_id)
        )
    )
)
WITH CHECK (
    profile_id = auth.uid()
    AND (
        org_id IS NULL
        OR (
            org_id = (auth.jwt() ->> 'org_id')::uuid
            AND public.is_active_ai_org_member(org_id)
        )
    )
);


-- ------------------------------------------------------------
-- DELETE
-- ------------------------------------------------------------

CREATE POLICY "Users can delete their own AI conversations"
ON public.ai_conversations
FOR DELETE
TO authenticated
USING (
    profile_id = auth.uid()
    AND (
        org_id IS NULL
        OR (
            org_id = (auth.jwt() ->> 'org_id')::uuid
            AND public.is_active_ai_org_member(org_id)
        )
    )
);