-- Migration: staleness should mean "hasn't opened the app," not "hasn't
-- changed their roster." score_updated_at only moves when characters are
-- saved, so someone who opens the tool regularly but isn't pulling new
-- 5-stars was being wrongly marked stale. last_seen_at is touched on every
-- app load regardless of whether anything changed, and is_active is
-- redefined to key off that instead.

ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Backfill: anyone who already has a score should at least count as seen
-- as of their last score update, so existing accounts don't all start
-- looking inactive the moment this migration runs.
UPDATE public.user_profiles
SET last_seen_at = score_updated_at
WHERE last_seen_at IS NULL AND score_updated_at IS NOT NULL;

-- =========================================================
-- Lightweight touch, called once per app load (not per action) from
-- characterStore's initializeCloud(). SECURITY DEFINER since it needs to
-- write a column the client doesn't otherwise have UPDATE access to here
-- (existing user_profiles RLS only covers the row's owner via the
-- x-user-id header anyway, so this isn't loosening anything — it's just
-- a small dedicated entrypoint instead of a raw .update() per session).
-- =========================================================

CREATE OR REPLACE FUNCTION public.touch_last_seen(
  target_user_id UUID
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.user_profiles
  SET last_seen_at = now()
  WHERE user_id = target_user_id;
$$;

GRANT EXECUTE
ON FUNCTION public.touch_last_seen(UUID)
TO anon, authenticated;

-- =========================================================
-- public_profiles: is_active now keys off last_seen_at, not
-- score_updated_at. Position/name of is_active stays the same, so this
-- is a safe CREATE OR REPLACE — last_seen_at is a new trailing column,
-- which is also fine to append.
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
    AND p.last_seen_at IS NOT NULL
    AND p.last_seen_at >= now() - interval '14 days'
  ) AS is_active,
  p.last_seen_at
FROM public.user_profiles p
JOIN public.users u
  ON u.user_id = p.user_id;

GRANT SELECT
ON public.public_profiles
TO anon, authenticated;

-- =========================================================
-- public_profiles_ranked: public_profiles just gained a new trailing
-- column (last_seen_at), which shifts where global_rank/total_players
-- land in pp.*'s expansion — same DROP-then-CREATE requirement as before.
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

-- =========================================================
-- get_union_members: is_active now keys off last_seen_at too.
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
      AND p.last_seen_at IS NOT NULL
      AND p.last_seen_at >= now() - interval '14 days'
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
