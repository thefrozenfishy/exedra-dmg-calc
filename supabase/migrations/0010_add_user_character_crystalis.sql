ALTER TABLE public.user_characters
DROP COLUMN crys;

ALTER TABLE public.user_characters
DROP COLUMN crys_sub;

ALTER TABLE public.user_characters
ADD COLUMN crys_options JSONB NOT NULL DEFAULT '{}'::jsonb;

DROP FUNCTION IF EXISTS public.get_public_characters(CHAR);

CREATE FUNCTION public.get_public_characters(
  target_friend_id CHAR(5)
)
RETURNS TABLE (
  character_id BIGINT,
  enabled BOOLEAN,
  dupes INT,
  ascension INT,
  kioku_lvl INT,
  magic_lvl INT,
  heartphial_lvl INT,
  special_lvl INT,
  portrait TEXT,
  crys_options JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    uc.character_id,
    uc.enabled,
    uc.dupes,
    uc.ascension,
    uc.kioku_lvl,
    uc.magic_lvl,
    uc.heartphial_lvl,
    uc.special_lvl,
    uc.portrait,
    uc.crys_options
  FROM public.user_characters uc
  JOIN public.users u
    ON u.user_id = uc.user_id
  WHERE u.friend_id = target_friend_id;
$$;

GRANT EXECUTE
ON FUNCTION public.get_public_characters(CHAR)
TO anon, authenticated;
