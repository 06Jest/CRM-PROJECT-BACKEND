-- ============================================================
-- AI Messages RLS
-- ============================================================

ALTER TABLE public.ai_messages
ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- SELECT
--
-- A user can view a message only when they can view the
-- parent AI conversation.
-- ------------------------------------------------------------

CREATE POLICY "Users can view messages from their AI conversations"
ON public.ai_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_messages.conversation_id
          AND ac.profile_id = auth.uid()
          AND (
              ac.org_id IS NULL
              OR (
                  ac.org_id = (auth.jwt() ->> 'org_id')::uuid
                  AND public.is_active_ai_org_member(ac.org_id)
              )
          )
    )
);


-- ------------------------------------------------------------
-- INSERT
--
-- Users can add messages only to AI conversations they own
-- and are authorized to access.
-- ------------------------------------------------------------

CREATE POLICY "Users can create messages in their AI conversations"
ON public.ai_messages
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_messages.conversation_id
          AND ac.profile_id = auth.uid()
          AND (
              ac.org_id IS NULL
              OR (
                  ac.org_id = (auth.jwt() ->> 'org_id')::uuid
                  AND public.is_active_ai_org_member(ac.org_id)
              )
          )
    )
);


-- ------------------------------------------------------------
-- UPDATE
-- ------------------------------------------------------------

CREATE POLICY "Users can update messages in their AI conversations"
ON public.ai_messages
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_messages.conversation_id
          AND ac.profile_id = auth.uid()
          AND (
              ac.org_id IS NULL
              OR (
                  ac.org_id = (auth.jwt() ->> 'org_id')::uuid
                  AND public.is_active_ai_org_member(ac.org_id)
              )
          )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_messages.conversation_id
          AND ac.profile_id = auth.uid()
          AND (
              ac.org_id IS NULL
              OR (
                  ac.org_id = (auth.jwt() ->> 'org_id')::uuid
                  AND public.is_active_ai_org_member(ac.org_id)
              )
          )
    )
);


-- ------------------------------------------------------------
-- DELETE
-- ------------------------------------------------------------

CREATE POLICY "Users can delete messages from their AI conversations"
ON public.ai_messages
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_messages.conversation_id
          AND ac.profile_id = auth.uid()
          AND (
              ac.org_id IS NULL
              OR (
                  ac.org_id = (auth.jwt() ->> 'org_id')::uuid
                  AND public.is_active_ai_org_member(ac.org_id)
              )
          )
    )
);