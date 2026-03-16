CREATE OR REPLACE FUNCTION public.soft_delete_project(_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rows_updated integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  UPDATE public.projects
  SET deleted_at = now(),
      updated_at = now()
  WHERE id = _project_id
    AND deleted_at IS NULL
    AND public.is_org_member(auth.uid(), org_id);

  GET DIAGNOSTICS _rows_updated = ROW_COUNT;
  RETURN _rows_updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_project(uuid) TO authenticated;