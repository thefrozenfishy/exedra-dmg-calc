ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS power_total integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_whale integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_attacker integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_buffer integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_debuffer integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_breaker integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_defender integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS power_healer integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS kioku_lim integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS kioku_lim_as integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS kioku_perm integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS kioku_perm_as integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS score_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_user_profiles_rank
    ON public.user_profiles (
        power_total DESC, power_whale DESC,
        kioku_lim_as DESC, kioku_lim DESC,
        kioku_perm_as DESC, kioku_perm DESC
    );


CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  u.friend_id,
  p.display_name,
  p.union_name,
  p.profile_icon,
  p.power_total,
  p.power_whale,
  p.power_attacker,
  p.power_buffer,
  p.power_debuffer,
  p.power_breaker,
  p.power_defender,
  p.power_healer,
  p.kioku_lim,
  p.kioku_lim_as,
  p.kioku_perm,
  p.kioku_perm_as,
  p.score_updated_at
FROM public.user_profiles p
JOIN public.users u
  ON u.user_id = p.user_id;

GRANT SELECT
ON public.public_profiles
TO anon, authenticated;


CREATE OR REPLACE VIEW public.public_profiles_ranked AS
SELECT
    pp.*,
    RANK() OVER (
        ORDER BY
            pp.power_total DESC, pp.power_whale DESC,
            pp.kioku_lim_as DESC, pp.kioku_lim DESC,
            pp.kioku_perm_as DESC, pp.kioku_perm DESC
    ) AS global_rank,
    COUNT(*) OVER () AS total_players
FROM public.public_profiles pp;

GRANT SELECT
ON public.public_profiles_ranked
TO anon, authenticated;


DROP FUNCTION IF EXISTS public.get_union_members(TEXT);

CREATE FUNCTION public.get_union_members(
  target_union TEXT
)
RETURNS TABLE (
  friend_id CHAR(5),
  display_name TEXT,
  union_name TEXT,
  profile_icon integer,
  power_total integer,
  power_whale integer,
  power_attacker integer,
  power_buffer integer,
  power_debuffer integer,
  power_breaker integer,
  power_defender integer,
  power_healer integer,
  kioku_lim integer,
  kioku_lim_as integer,
  kioku_perm integer,
  kioku_perm_as integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    u.friend_id,
    p.display_name,
    p.union_name,
    p.profile_icon,
    p.power_total,
    p.power_whale,
    p.power_attacker,
    p.power_buffer,
    p.power_debuffer,
    p.power_breaker,
    p.power_defender,
    p.power_healer,
    p.kioku_lim,
    p.kioku_lim_as,
    p.kioku_perm,
    p.kioku_perm_as
  FROM public.user_profiles p
  JOIN public.users u
    ON u.user_id = p.user_id
  WHERE lower(trim(p.union_name)) = lower(trim(target_union))
  AND trim(target_union) <> '';
$$;

GRANT EXECUTE
ON FUNCTION public.get_union_members(TEXT)
TO anon, authenticated;
