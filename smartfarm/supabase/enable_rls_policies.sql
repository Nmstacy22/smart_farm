-- ==========================================================
-- SMARTFARM SQL: ENABLE ROW LEVEL SECURITY (PRODUCTION)
-- Run this whole script in the Supabase SQL Editor. It is safe to re-run.
-- Run supabase/schema_additions.sql first: the functions below use its tables.
-- It replaces supabase/fix_rls_policies.sql (which disabled RLS for demos).
--
-- Access model (based on public.farm_user_roles):
--   * Members of a farm (owner / manager / worker) can read that farm's data
--     and create/update day-to-day records (fields, livestock, inventory, tasks...).
--   * Only owners and managers can delete records, manage the team, and edit
--     farm settings. Only owners can delete the farm.
--   * Finance tables are visible to owners and managers only.
--   * Farms are created and joined through the create_farm / join_farm functions,
--     never by inserting into farm / farm_user_roles directly.
-- ==========================================================

-- ----------------------------------------------------------
-- 1. Helper functions
--    SECURITY DEFINER so policies can check membership without
--    recursing into farm_user_roles' own policies.
-- ----------------------------------------------------------

-- The signed-in user's role on a farm ('owner' / 'manager' / 'worker'), or NULL if not a member.
-- SET search_path = '' stops a caller from shadowing tables with their own objects.
CREATE OR REPLACE FUNCTION public.sf_farm_role(p_farm_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.farm_user_roles
  WHERE farm_id = p_farm_id AND user_id = auth.uid() AND deleted_at IS NULL
  LIMIT 1;
$$;

-- True for any role on the farm.
CREATE OR REPLACE FUNCTION public.sf_is_member(p_farm_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.sf_farm_role(p_farm_id) IS NOT NULL;
$$;

-- True for owners and managers. coalesce turns "not a member" (NULL) into false.
CREATE OR REPLACE FUNCTION public.sf_is_manager(p_farm_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(public.sf_farm_role(p_farm_id) IN ('owner', 'manager'), false);
$$;

-- True if the signed-in user and p_user_id belong to at least one common farm.
-- Used so teammates can see each other's names without exposing every profile.
CREATE OR REPLACE FUNCTION public.sf_shares_farm_with(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.farm_user_roles mine
    JOIN public.farm_user_roles theirs ON theirs.farm_id = mine.farm_id
    WHERE mine.user_id = auth.uid() AND theirs.user_id = p_user_id
      AND mine.deleted_at IS NULL AND theirs.deleted_at IS NULL
  );
$$;

-- ----------------------------------------------------------
-- 2. Farm creation and joining (called from the app via supabase.rpc)
-- ----------------------------------------------------------

-- Creates a farm and makes the caller its owner in one step. This has to run as
-- SECURITY DEFINER: until the owner row exists, the caller isn't a member and RLS
-- would hide the farm they just created.
CREATE OR REPLACE FUNCTION public.create_farm(p_name text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_farm_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.farm (name)
  VALUES (coalesce(nullif(trim(p_name), ''), 'My Farm'))
  RETURNING id INTO v_farm_id;

  INSERT INTO public.farm_user_roles (farm_id, user_id, role)
  VALUES (v_farm_id, auth.uid(), 'owner');

  RETURN v_farm_id;
END;
$$;

-- Invite codes live in public.farm_join_codes (see schema_additions.sql) and look like
-- "7F3A9-C21B0": 10 hex characters from gen_random_uuid(), which is cryptographically
-- random, so codes can't be guessed. The farm ID is no longer used to join.
CREATE OR REPLACE FUNCTION public.sf_new_join_code()
RETURNS text
LANGUAGE sql VOLATILE
SET search_path = ''
AS $$
  SELECT upper(substr(h, 1, 5) || '-' || substr(h, 6, 5))
  FROM (SELECT replace(gen_random_uuid()::text, '-', '') AS h) s;
$$;

-- Returns the farm's invite code, creating one on first use. Owners/managers only.
CREATE OR REPLACE FUNCTION public.get_join_code(p_farm_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code text;
BEGIN
  IF NOT public.sf_is_manager(p_farm_id) THEN
    RAISE EXCEPTION 'Only farm owners and managers can view the invite code';
  END IF;

  SELECT code INTO v_code FROM public.farm_join_codes WHERE farm_id = p_farm_id;
  IF v_code IS NULL THEN
    INSERT INTO public.farm_join_codes (farm_id, code, created_by)
    VALUES (p_farm_id, public.sf_new_join_code(), auth.uid())
    RETURNING code INTO v_code;
  END IF;
  RETURN v_code;
END;
$$;

-- Replaces the invite code, so a leaked code stops working. Owners/managers only.
CREATE OR REPLACE FUNCTION public.regenerate_join_code(p_farm_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code text;
BEGIN
  IF NOT public.sf_is_manager(p_farm_id) THEN
    RAISE EXCEPTION 'Only farm owners and managers can change the invite code';
  END IF;

  INSERT INTO public.farm_join_codes (farm_id, code, created_by)
  VALUES (p_farm_id, public.sf_new_join_code(), auth.uid())
  ON CONFLICT (farm_id) DO UPDATE
    SET code = EXCLUDED.code, created_by = EXCLUDED.created_by, created_at = now()
  RETURNING code INTO v_code;
  RETURN v_code;
END;
$$;

-- Joins the farm that owns the invite code, as a worker. Returns the farm ID.
-- Earlier versions took the farm ID itself; drop that signature.
DROP FUNCTION IF EXISTS public.join_farm(uuid);
CREATE OR REPLACE FUNCTION public.join_farm(p_code text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_farm_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Codes are matched case-insensitively and ignoring spaces
  SELECT j.farm_id INTO v_farm_id
  FROM public.farm_join_codes j
  JOIN public.farm f ON f.id = j.farm_id AND f.deleted_at IS NULL
  WHERE j.code = upper(replace(trim(p_code), ' ', ''));

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Invalid Join Code';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.farm_user_roles
    WHERE farm_id = v_farm_id AND user_id = auth.uid() AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'You are already a member of this farm';
  END IF;

  INSERT INTO public.farm_user_roles (farm_id, user_id, role)
  VALUES (v_farm_id, auth.uid(), 'worker');

  RETURN v_farm_id;
END;
$$;

-- Functions are executable by everyone by default; restrict these to signed-in users.
REVOKE ALL ON FUNCTION public.create_farm(text) FROM public, anon;
REVOKE ALL ON FUNCTION public.join_farm(text) FROM public, anon;
REVOKE ALL ON FUNCTION public.get_join_code(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.regenerate_join_code(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_farm(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_farm(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_join_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_join_code(uuid) TO authenticated;

-- A farm must always keep at least one owner: block demoting or removing the last one.
CREATE OR REPLACE FUNCTION public.sf_keep_last_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.role = 'owner' AND (TG_OP = 'DELETE' OR NEW.role <> 'owner') AND NOT EXISTS (
    SELECT 1 FROM public.farm_user_roles
    WHERE farm_id = OLD.farm_id AND role = 'owner' AND id <> OLD.id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'A farm must keep at least one owner';
  END IF;
  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sf_keep_last_owner ON public.farm_user_roles;
CREATE TRIGGER sf_keep_last_owner
  BEFORE UPDATE OR DELETE ON public.farm_user_roles
  FOR EACH ROW EXECUTE FUNCTION public.sf_keep_last_owner();

-- ----------------------------------------------------------
-- 3. Remove every existing policy on the app's tables, so no
--    leftover permissive policy can widen access, then enable RLS.
-- ----------------------------------------------------------

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;

  FOR r IN
    SELECT c.relname AS tablename FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END;
$$;

-- ----------------------------------------------------------
-- 4. farm, farm_user_roles, user_profile
--    USING decides which existing rows a user can see/change;
--    WITH CHECK decides what a new or updated row is allowed to look like.
-- ----------------------------------------------------------

-- farm: no INSERT policy on purpose; new farms only come from create_farm.
CREATE POLICY sf_select ON public.farm FOR SELECT TO authenticated
  USING (public.sf_is_member(id));
CREATE POLICY sf_update ON public.farm FOR UPDATE TO authenticated
  USING (public.sf_is_manager(id)) WITH CHECK (public.sf_is_manager(id));
CREATE POLICY sf_delete ON public.farm FOR DELETE TO authenticated
  USING (public.sf_farm_role(id) = 'owner');

-- farm_user_roles: members see their team. Owners/managers add, change and remove
-- members, but only an owner can grant the 'owner' role or touch an owner's row
-- (so a manager can't demote or remove the owner). Anyone can delete their own
-- row, i.e. leave a farm. The sf_keep_last_owner trigger stops the last owner leaving.
CREATE POLICY sf_select ON public.farm_user_roles FOR SELECT TO authenticated
  USING (public.sf_is_member(farm_id));
CREATE POLICY sf_insert ON public.farm_user_roles FOR INSERT TO authenticated
  WITH CHECK (public.sf_is_manager(farm_id) AND (role <> 'owner' OR public.sf_farm_role(farm_id) = 'owner'));
CREATE POLICY sf_update ON public.farm_user_roles FOR UPDATE TO authenticated
  USING (public.sf_is_manager(farm_id) AND (role <> 'owner' OR public.sf_farm_role(farm_id) = 'owner'))
  WITH CHECK (public.sf_is_manager(farm_id) AND (role <> 'owner' OR public.sf_farm_role(farm_id) = 'owner'));
CREATE POLICY sf_delete ON public.farm_user_roles FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (public.sf_is_manager(farm_id) AND (role <> 'owner' OR public.sf_farm_role(farm_id) = 'owner'))
  );

-- user_profile: has no farm_id. You see your own profile and your teammates';
-- you can only create or edit your own.
CREATE POLICY sf_select ON public.user_profile FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.sf_shares_farm_with(id));
CREATE POLICY sf_insert ON public.user_profile FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY sf_update ON public.user_profile FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------
-- 5. Farm-scoped tables
--    Every table here has a farm_id column, so the same rules are generated
--    for each one. When you add a new farm_id table, add it to one of these lists.
-- ----------------------------------------------------------

DO $$
DECLARE
  t text;
  -- Day-to-day records: any member reads/creates/updates, managers delete.
  operational text[] := ARRAY[
    'audit_events', 'fields', 'farm_documents',
    'crop_types', 'crop_cycles', 'crop_cycle_field_assignments', 'crop_operations', 'crop_measurements',
    'livestock_types', 'livestock_units', 'livestock_animals', 'livestock_health_events', 'livestock_weights',
    'inventory_items', 'inventory_item_units', 'inventory_locations', 'inventory_batches',
    'inventory_expirations', 'inventory_adjustment_reason_codes', 'inventory_movements', 'stock_levels',
    'activity_types', 'activities',
    'task_statuses', 'tasks', 'task_assignments', 'task_attachments',
    'sensor_device_farm_bindings', 'sensor_measurements_normalized', 'ai_jobs', 'ai_outputs'
  ];
  -- Owner/manager only, for every operation.
  restricted text[] := ARRAY[
    'financial_accounts', 'financial_transaction_categories', 'financial_transactions',
    'report_definitions', 'report_runs'
  ];
BEGIN
  FOREACH t IN ARRAY operational LOOP
    -- Skip tables from db.sql that don't exist in this project yet
    CONTINUE WHEN to_regclass('public.' || t) IS NULL;
    EXECUTE format('CREATE POLICY sf_select ON public.%I FOR SELECT TO authenticated USING (public.sf_is_member(farm_id))', t);
    EXECUTE format('CREATE POLICY sf_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.sf_is_member(farm_id))', t);
    EXECUTE format('CREATE POLICY sf_update ON public.%I FOR UPDATE TO authenticated USING (public.sf_is_member(farm_id)) WITH CHECK (public.sf_is_member(farm_id))', t);
    EXECUTE format('CREATE POLICY sf_delete ON public.%I FOR DELETE TO authenticated USING (public.sf_is_manager(farm_id))', t);
  END LOOP;

  FOREACH t IN ARRAY restricted LOOP
    CONTINUE WHEN to_regclass('public.' || t) IS NULL;
    EXECUTE format('CREATE POLICY sf_all ON public.%I FOR ALL TO authenticated USING (public.sf_is_manager(farm_id)) WITH CHECK (public.sf_is_manager(farm_id))', t);
  END LOOP;
END;
$$;

-- Tables with RLS enabled but deliberately no policies, so the app can't touch them directly:
--   * farm_join_codes: only used inside get_join_code / regenerate_join_code / join_farm.
--   * sensor_devices, sensor_measurements_raw: no farm_id; only the service role
--     (server-side ingestion) can use them.
