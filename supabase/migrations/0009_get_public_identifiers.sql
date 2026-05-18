-- Return a public identifier for user_ids: friend_id when present, otherwise the uuid text

CREATE OR REPLACE FUNCTION public.get_public_identifiers(target_user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  public_id text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    t.uid::uuid AS user_id,
    COALESCE(u.friend_id::text, t.uid::text) AS public_id
  FROM unnest(target_user_ids) AS t(uid)
  LEFT JOIN public.users u ON u.user_id = t.uid;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_identifiers(uuid[]) TO anon, authenticated;
