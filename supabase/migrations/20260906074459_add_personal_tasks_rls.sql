DROP POLICY "Members can create organization tasks"
ON public.tasks;

CREATE POLICY "Users can create accessible tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (
    org_id = ((auth.jwt() ->> 'org_id')::uuid)
    AND
    author_id = ((auth.jwt() ->> 'member_id')::uuid)
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

DROP POLICY "Members can view accessible organization tasks"
ON public.tasks;

CREATE POLICY "Users can view accessible tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  (
    org_id = ((auth.jwt() ->> 'org_id')::uuid)
    AND
    (
      visibility = 'public'
      OR author_id = ((auth.jwt() ->> 'member_id')::uuid)
      OR assigned_to = ((auth.jwt() ->> 'member_id')::uuid)
    )
  )
  OR
  (
    org_id IS NULL
    AND profile_id = auth.uid()
    AND target_type = 'personal'
  )
);