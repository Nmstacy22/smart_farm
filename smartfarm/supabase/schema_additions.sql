-- ==========================================================
-- SMARTFARM SQL: SCHEMA ADDITIONS
-- Tables and columns added on top of db.sql. Safe to re-run.
-- Run order in the Supabase SQL Editor:
--   1. supabase/schema_additions.sql   (this file)
--   2. supabase/enable_rls_policies.sql
-- ==========================================================

-- ----------------------------------------------------------
-- Farm invite codes
-- One active code per farm. Only reachable through the
-- get_join_code / regenerate_join_code / join_farm functions.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farm_join_codes (
  farm_id uuid PRIMARY KEY REFERENCES public.farm(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- User profiles
-- Store the email so teammates see a readable name, and create a
-- profile automatically for every new sign-up.
-- ----------------------------------------------------------
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS email text;

CREATE OR REPLACE FUNCTION public.sf_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profile (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sf_on_auth_user_created ON auth.users;
CREATE TRIGGER sf_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sf_handle_new_user();

-- Backfill profiles for users who signed up before the trigger existed
INSERT INTO public.user_profile (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
