DROP POLICY IF EXISTS "Members can update org projects" ON public.projects;

CREATE POLICY "Members can update org projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));