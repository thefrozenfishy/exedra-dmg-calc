-- Migration: cloud storage + link sharing for saved teams (Single Battle Calculator and PvP Simulator).
--
-- Same model as 0021_tier_lists.sql, with one table for both simulators:
--   * kind = 'single' holds one team of 5 slots, kind = 'pvp' holds [enemy team, allied team].
--   * A team is private unless its owner flips is_shared, in which case anyone holding the link
--     (the team's random UUID) can read it through get_shared_team. Teams are never enumerable.
--   * Inserts and content updates only go through save_team_safe (optimistic concurrency + a cap per
--     user and kind); reordering goes through set_team_order; reads of your own teams and deletes go
--     straight to the table under RLS.

-- =========================================================
-- Table
-- =========================================================

CREATE TABLE public.user_saved_teams (
  team_id UUID PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,

  kind TEXT NOT NULL,

  name TEXT NOT NULL DEFAULT '',

  -- { slots: [[{ main?, support?, buffMultReduction?, debuffMultReduction? } x5], ...] }
  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  sort_order INT NOT NULL DEFAULT 0,
  is_shared BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- The anon key is public, so bound what a client can store.
  CONSTRAINT saved_team_kind CHECK (kind IN ('single', 'pvp')),
  CONSTRAINT saved_team_name_len CHECK (char_length(name) <= 200),
  CONSTRAINT saved_team_data_shape CHECK (
    jsonb_typeof(data) = 'object' AND octet_length(data::text) <= 60000
  )
);

CREATE INDEX idx_user_saved_teams_user
ON public.user_saved_teams(user_id, kind, sort_order);

-- updated_at is the optimistic-concurrency token, so it must only move when the *content* changes.
CREATE OR REPLACE FUNCTION public.touch_saved_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name
     OR NEW.data IS DISTINCT FROM OLD.data
     OR NEW.is_shared IS DISTINCT FROM OLD.is_shared
  THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_saved_teams_touch_updated_at
BEFORE UPDATE ON public.user_saved_teams
FOR EACH ROW
EXECUTE FUNCTION public.touch_saved_team_updated_at();

-- =========================================================
-- RLS + grants
-- =========================================================

ALTER TABLE public.user_saved_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own saved teams"
ON public.user_saved_teams
FOR SELECT
USING (
  user_id = NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
);

CREATE POLICY "update own saved teams"
ON public.user_saved_teams
FOR UPDATE
USING (
  user_id = NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
);

CREATE POLICY "delete own saved teams"
ON public.user_saved_teams
FOR DELETE
USING (
  user_id = NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
);

-- No INSERT policy or grant on purpose: creation goes through save_team_safe.
GRANT SELECT, DELETE
ON public.user_saved_teams
TO anon, authenticated;

GRANT UPDATE (sort_order)
ON public.user_saved_teams
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_saved_teams
TO service_role;

-- =========================================================
-- save_team_safe
-- =========================================================
-- Same contract as save_tier_list_safe: the write only happens if p_known_updated_at still matches
-- (or the row doesn't exist yet). Otherwise the current server row comes back with conflict = true.

CREATE OR REPLACE FUNCTION public.save_team_safe(
  target_user_id UUID,
  p_team_id UUID,
  p_kind TEXT,
  p_name TEXT,
  p_data JSONB,
  p_is_shared BOOLEAN,
  p_sort_order INT,
  p_known_updated_at TIMESTAMPTZ
)
RETURNS TABLE (
  team_id UUID,
  conflict BOOLEAN,
  kind TEXT,
  name TEXT,
  data JSONB,
  sort_order INT,
  is_shared BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur public.user_saved_teams%ROWTYPE;
BEGIN
  IF target_user_id IS DISTINCT FROM
     NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
  THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO cur
  FROM public.user_saved_teams t
  WHERE t.team_id = p_team_id
  FOR UPDATE;

  IF NOT FOUND THEN
    IF (
      SELECT count(*) FROM public.user_saved_teams t
      WHERE t.user_id = target_user_id AND t.kind = p_kind
    ) >= 200 THEN
      RAISE EXCEPTION 'Saved team limit reached';
    END IF;

    INSERT INTO public.user_saved_teams (
      team_id, user_id, kind, name, data, is_shared, sort_order
    ) VALUES (
      p_team_id, target_user_id, p_kind, p_name, p_data, p_is_shared, p_sort_order
    )
    RETURNING * INTO cur;

    conflict := false;

  ELSIF cur.user_id <> target_user_id OR cur.kind <> p_kind THEN
    RAISE EXCEPTION 'Forbidden';

  ELSIF p_known_updated_at IS NULL OR cur.updated_at > p_known_updated_at THEN
    conflict := true;

  ELSE
    UPDATE public.user_saved_teams t
    SET
      name = p_name,
      data = p_data,
      is_shared = p_is_shared
    WHERE t.team_id = p_team_id
    RETURNING * INTO cur;

    conflict := false;
  END IF;

  team_id := cur.team_id;
  kind := cur.kind;
  name := cur.name;
  data := cur.data;
  sort_order := cur.sort_order;
  is_shared := cur.is_shared;
  created_at := cur.created_at;
  updated_at := cur.updated_at;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE
ON FUNCTION public.save_team_safe(UUID, UUID, TEXT, TEXT, JSONB, BOOLEAN, INT, TIMESTAMPTZ)
TO anon, authenticated;

-- =========================================================
-- set_team_order
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_team_order(
  target_user_id UUID,
  p_kind TEXT,
  ordered_ids UUID[]
)
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE public.user_saved_teams t
  SET sort_order = o.pos - 1
  FROM unnest(ordered_ids) WITH ORDINALITY AS o(id, pos)
  WHERE t.user_id = target_user_id
    AND t.kind = p_kind
    AND t.team_id = o.id;
$$;

GRANT EXECUTE
ON FUNCTION public.set_team_order(UUID, TEXT, UUID[])
TO anon, authenticated;

-- =========================================================
-- get_shared_team
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_shared_team(
  target_team_id UUID
)
RETURNS TABLE (
  team_id UUID,
  kind TEXT,
  name TEXT,
  data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  owner_display_name TEXT,
  owner_friend_id CHAR(5),
  is_owner BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.team_id,
    t.kind,
    t.name,
    t.data,
    t.created_at,
    t.updated_at,
    COALESCE(p.display_name, ''),
    u.friend_id,
    t.user_id IS NOT DISTINCT FROM
      NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
  FROM public.user_saved_teams t
  JOIN public.users u ON u.user_id = t.user_id
  LEFT JOIN public.user_profiles p ON p.user_id = t.user_id
  WHERE t.team_id = target_team_id
    AND t.is_shared;
$$;

GRANT EXECUTE
ON FUNCTION public.get_shared_team(UUID)
TO anon, authenticated;
