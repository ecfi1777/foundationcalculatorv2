
-- Trigger function to auto-provision user row, org, org_member, and user_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Create user row
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Create personal organization
  INSERT INTO public.organizations (name, owner_id)
  VALUES (COALESCE(split_part(NEW.email, '@', 1), 'My Organization'), NEW.id)
  RETURNING id INTO _org_id;

  -- Add user as org owner
  INSERT INTO public.org_members (org_id, user_id, role, status, joined_at)
  VALUES (_org_id, NEW.id, 'owner', 'active', now());

  -- Create default user_settings
  INSERT INTO public.user_settings (user_id, active_org_id)
  VALUES (NEW.id, _org_id);

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
