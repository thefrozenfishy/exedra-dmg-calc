-- One-time fix: service_role was never explicitly granted privileges on
-- these tables (0001 only granted to anon/authenticated). service_role
-- normally bypasses RLS, but still needs ordinary GRANTs to touch tables
-- at all -- RLS bypass and table privileges are separate things in
-- Postgres. Run this once in the Supabase SQL editor before the backfill.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.users
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_characters
TO service_role;

GRANT SELECT, INSERT, UPDATE
ON public.user_profiles
TO service_role;

-- Not strictly needed by backfill.ts today, but harmless and likely
-- useful if you ever write other service-role scripts against these:
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_friends
TO service_role;

GRANT SELECT
ON public.public_profiles
TO service_role;

GRANT SELECT
ON public.public_profiles_ranked
TO service_role;
