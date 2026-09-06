DROP POLICY "Members can view accessible notes"
ON public.notes;

CREATE POLICY "Users can view accessible notes"
ON public.notes
FOR SELECT
TO authenticated
USING (
  (
    org_id = ((auth.jwt() ->> 'org_id')::uuid)
  )
  OR
  (
    org_id IS NULL
    AND profile_id = auth.uid()
    AND target_type = 'personal'
  )
);