-- =========================================================
-- Union support
-- =========================================================

ALTER TABLE public.user_profiles
ADD COLUMN profile_icon integer DEFAULT 10010101 NOT NULL,
ADD COLUMN union_name TEXT NOT NULL DEFAULT '';

-- =========================================================
-- Friend favorites
-- =========================================================

ALTER TABLE public.user_friends
ADD COLUMN favorite BOOLEAN NOT NULL DEFAULT false;

-- =========================================================
-- Public profiles view
-- =========================================================

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  u.friend_id,
  p.display_name,
  p.union_name,
  p.profile_icon
FROM public.user_profiles p
JOIN public.users u
  ON u.user_id = p.user_id;

-- =========================================================
-- Union lookup
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_union_members(
  target_union TEXT
)
RETURNS TABLE (
  friend_id CHAR(5),
  display_name TEXT,
  union_name TEXT,
  profile_icon integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    u.friend_id,
    p.display_name,
    p.union_name,
    p.profile_icon
  FROM public.user_profiles p
  JOIN public.users u
    ON u.user_id = p.user_id
  WHERE lower(trim(p.union_name)) = lower(trim(target_union))
  AND trim(target_union) <> '';
$$;

GRANT EXECUTE
ON FUNCTION public.get_union_members
TO anon, authenticated;