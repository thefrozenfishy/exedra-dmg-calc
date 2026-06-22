-- Migration: filter "bad" accounts (no display name set, or no score
-- update in 14 days) out of the everyone/discovery board and the global
-- rank denominator — but NOT out of a player's own friends/union list,
-- where a stale friend should still show up (just visibly marked stale).

-- =========================================================
-- public_profiles: add is_active, still includes every row.
-- Friends/union reads stay unfiltered so a stale friend you already
-- follow keeps showing up — just with is_active = false so the UI can
-- grey them out.
-- =========================================================

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
  p.score_updated_at,
  (
    p.display_name <> ''
    AND p.score_updated_at IS NOT NULL
    AND p.score_updated_at >= now() - interval '14 days'
  ) AS is_active
FROM public.user_profiles p
JOIN public.users u
  ON u.user_id = p.user_id;

GRANT SELECT
ON public.public_profiles
TO anon, authenticated;

-- =========================================================
-- Rank is computed only over active profiles, so the denominator is the
-- active population (e.g. #234/800), not every row that ever existed.
--
-- public_profiles just gained a new column (is_active) ahead of where
-- global_rank/total_players used to sit in public_profiles_ranked's output
-- (pp.* expands first, so is_active now lands where global_rank was).
-- CREATE OR REPLACE VIEW can't shift/rename existing output columns, only
-- append new ones at the end — same restriction that needed DROP FUNCTION
-- for get_union_members below. Dropping first avoids the same error here.
-- =========================================================

DROP VIEW IF EXISTS public.public_profiles_ranked;

CREATE VIEW public.public_profiles_ranked AS
SELECT
    pp.*,
    RANK() OVER (
        ORDER BY
            pp.power_total DESC, pp.power_whale DESC,
            pp.kioku_lim_as DESC, pp.kioku_lim DESC,
            pp.kioku_perm_as DESC, pp.kioku_perm DESC
    ) AS global_rank,
    COUNT(*) OVER () AS total_players
FROM public.public_profiles pp
WHERE pp.is_active;

GRANT SELECT
ON public.public_profiles_ranked
TO anon, authenticated;

-- A player who is themselves inactive (no name, or stale) has no row in
-- public_profiles_ranked at all now, which is what the client uses to
-- distinguish "no rank because you're unranked" from "you're rank #1".

-- =========================================================
-- get_union_members: also flag is_active per row, so union lists can grey
-- out stale members the same way friends do, instead of just dropping them
-- (a union roster, unlike the discovery board, is still "your people").
-- =========================================================

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
  is_active boolean
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
    ) AS is_active
  FROM public.user_profiles p
  JOIN public.users u
    ON u.user_id = p.user_id
  WHERE lower(trim(p.union_name)) = lower(trim(target_union))
  AND trim(target_union) <> '';
$$;

GRANT EXECUTE
ON FUNCTION public.get_union_members(TEXT)
TO anon, authenticated;