-- Resolve a public friend_id code back to its underlying user_id, for admin/debug
-- tooling (the analytics user-inspector page) that only has the public code to
-- search by -- e.g. from a bug report that mentions a friend code, not a uuid.
--
-- SECURITY DEFINER because public.users' SELECT RLS policy restricts reads to
-- the caller's own row (matched on the x-user-id header), which would make a
-- plain client-side select unusable for looking up *other* players' rows.
-- Mirrors the existing get_public_identifiers()/check_user_exists() pattern.

CREATE OR REPLACE FUNCTION public.get_user_id_by_friend_id(target_friend_id text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_id
  FROM public.users
  WHERE friend_id = upper(trim(target_friend_id))
  LIMIT 1;
$$;

GRANT EXECUTE
ON FUNCTION public.get_user_id_by_friend_id(text)
TO anon, authenticated;
