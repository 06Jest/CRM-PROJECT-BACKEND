DROP POLICY IF EXISTS "Members can create notes"
ON public.notes;

CREATE POLICY "Members can create notes"
ON public.notes
FOR INSERT
TO authenticated
WITH CHECK (
  (
    org_id = ((auth.jwt() ->> 'org_id')::uuid)
    AND author_id = ((auth.jwt() ->> 'member_id')::uuid)
  )
  OR
  (
    org_id IS NULL
    AND author_id IS NULL
    AND profile_id = auth.uid()
    AND target_type = 'personal'
    AND target_id IS NULL
    AND visibility = 'private'
  )
);