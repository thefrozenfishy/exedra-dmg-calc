-- Migration: stop handing out account ids.
--
-- A user_id is the account's only credential: every RLS policy and *_safe function trusts the x-user-id
-- header alone, so whoever knows an id can read, overwrite and delete that account. Before this migration
-- the id was readable without an account in three places:
--   1. user_profiles: the "public read profiles" policy (USING true) plus the anon SELECT grant from 0002
--      let anyone list every row's user_id.
--   2. get_user_id_by_friend_id (0019) turned any public friend code (leaderboard, unions) into its id.
--   3. analytics (0008): open SELECT, and every logged event carries the account id.
--
-- Fixes:
--   1. user_profiles is readable only by its owner. Every direct client read already filters on the
--      caller's own user_id (store/cloud.ts); public reads go through the public_profiles* views and the
--      SECURITY DEFINER functions, which run as the table owner and are unaffected.
--   2./3. Analytics reads and the id lookups behind the Analytics pages are limited to admins listed in
--      app_admins. "Admin" used to be a localStorage flag only, which the database can't check.
--
-- AFTER DEPLOYING: add your own account id, or the Analytics pages show no rows:
--   INSERT INTO public.app_admins (user_id) VALUES ('<your user_id from localStorage "userId">');

-- =========================================================
-- 1. user_profiles: owner-only reads
-- =========================================================

DROP POLICY IF EXISTS "public read profiles" ON public.user_profiles;

CREATE POLICY "read own profile"
ON public.user_profiles
FOR SELECT
USING (user_id = public.request_user_id());

-- =========================================================
-- Admins (server-side)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id UUID PRIMARY KEY
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No policies and no anon/authenticated grants: only is_app_admin() and the SQL editor read it.
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.app_admins TO service_role;

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_admins a WHERE a.user_id = public.request_user_id()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_app_admin() TO anon, authenticated, service_role;

-- =========================================================
-- 2. Id lookups: admins only
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_user_id_by_friend_id(target_friend_id text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id
  FROM public.users
  WHERE friend_id = upper(trim(target_friend_id))
    AND public.is_app_admin()
  LIMIT 1;
$$;

-- Non-admins get no rows (the Analytics Dashboard then just shows the raw ids it can't read anyway).
CREATE OR REPLACE FUNCTION public.get_public_identifiers(target_user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  public_id text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.uid::uuid AS user_id,
    COALESCE(u.friend_id::text, t.uid::text) AS public_id
  FROM unnest(target_user_ids) AS t(uid)
  LEFT JOIN public.users u ON u.user_id = t.uid
  WHERE public.is_app_admin();
$$;

-- =========================================================
-- 3. analytics: anyone can log, only admins can read
-- =========================================================

DROP POLICY IF EXISTS "allow select analytics" ON public.analytics;

CREATE POLICY "admins read analytics"
ON public.analytics
FOR SELECT
USING (public.is_app_admin());
