-- Migration: surface real global_rank/total_players on union members too,
-- so the rank badge is consistent everywhere (friends, everyone, union) —
-- previously only public_profiles_ranked (used by friends/everyone) had
-- real ranks; union members fell back to a client-side approximation.

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
  kioku_perm_as integer,
  is_active boolean,
  global_rank bigint,
  total_players bigint
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
    p.kioku_perm_as,
    (
      p.display_name <> ''
      AND p.score_updated_at IS NOT NULL
      AND p.score_updated_at >= now() - interval '14 days'
    ) AS is_active,
    pr.global_rank,
    pr.total_players
  FROM public.user_profiles p
  JOIN public.users u
    ON u.user_id = p.user_id
  LEFT JOIN public.public_profiles_ranked pr
    ON pr.friend_id = u.friend_id
  WHERE lower(trim(p.union_name)) = lower(trim(target_union))
  AND trim(target_union) <> '';
$$;

GRANT EXECUTE
ON FUNCTION public.get_union_members(TEXT)
TO anon, authenticated;
