-- Migration: cloud storage + link sharing for the Tier List Maker.
--
-- Each user's lists live in user_tier_lists. A list is private unless its owner flips is_shared, in
-- which case anyone holding the link (the list's random UUID) can read it through
-- get_shared_tier_list. Lists are never enumerable: there is no "browse everyone's lists" surface.
--
-- Write model (mirrors 0020_safe_character_save.sql):
--   * Inserts and content updates only go through save_tier_list_safe, which does row-level
--     optimistic concurrency, enforces a per-user cap, and can't be bypassed because the table has
--     no INSERT grant and only sort_order is UPDATE-able directly.
--   * Reordering uses set_tier_list_order, which doesn't count as a content change.
--   * Reads of your own lists and deletes go straight to the table under RLS.

-- =========================================================
-- Table
-- =========================================================

CREATE TABLE public.user_tier_lists (
  list_id UUID PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,

  name TEXT NOT NULL DEFAULT '',

  -- [{ id, label, color }]
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- { [row id]: [character id, ...] }
  placements JSONB NOT NULL DEFAULT '{}'::jsonb,

  sort_order INT NOT NULL DEFAULT 0,
  is_shared BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- The anon key is public, so bound what a client can store.
  CONSTRAINT tier_list_name_len CHECK (char_length(name) <= 200),
  CONSTRAINT tier_list_rows_shape CHECK (
    jsonb_typeof(rows) = 'array' AND octet_length(rows::text) <= 30000
  ),
  CONSTRAINT tier_list_placements_shape CHECK (
    jsonb_typeof(placements) = 'object' AND octet_length(placements::text) <= 100000
  )
);

CREATE INDEX idx_user_tier_lists_user
ON public.user_tier_lists(user_id, sort_order);

-- updated_at is the optimistic-concurrency token, so it must only move when the *content* changes.
-- (Reordering lists shouldn't make another device think its copy of a list is stale.)
CREATE OR REPLACE FUNCTION public.touch_tier_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name
     OR NEW.rows IS DISTINCT FROM OLD.rows
     OR NEW.placements IS DISTINCT FROM OLD.placements
     OR NEW.is_shared IS DISTINCT FROM OLD.is_shared
  THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_tier_lists_touch_updated_at
BEFORE UPDATE ON public.user_tier_lists
FOR EACH ROW
EXECUTE FUNCTION public.touch_tier_list_updated_at();

-- =========================================================
-- RLS + grants
-- =========================================================

ALTER TABLE public.user_tier_lists ENABLE ROW LEVEL SECURITY;

-- NULLIF: the client sends an empty x-user-id when there is no cloud account, and ''::uuid would raise.
CREATE POLICY "read own tier lists"
ON public.user_tier_lists
FOR SELECT
USING (
  user_id = NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
);

CREATE POLICY "update own tier lists"
ON public.user_tier_lists
FOR UPDATE
USING (
  user_id = NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
);

CREATE POLICY "delete own tier lists"
ON public.user_tier_lists
FOR DELETE
USING (
  user_id = NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
);

-- No INSERT policy or grant on purpose: creation goes through save_tier_list_safe.
GRANT SELECT, DELETE
ON public.user_tier_lists
TO anon, authenticated;

GRANT UPDATE (sort_order)
ON public.user_tier_lists
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_tier_lists
TO service_role;

-- =========================================================
-- save_tier_list_safe
-- =========================================================
-- Same contract as save_characters_safe: the caller sends the updated_at it last confirmed. The write
-- only happens if that still matches (or the row doesn't exist yet). Otherwise nothing is written and
-- the current server row comes back with conflict = true, so the client can adopt it instead of
-- clobbering a change made on another device.
--
-- Column-named OUT params: every table reference below is alias-qualified to avoid ambiguity.

CREATE OR REPLACE FUNCTION public.save_tier_list_safe(
  target_user_id UUID,
  p_list_id UUID,
  p_name TEXT,
  p_rows JSONB,
  p_placements JSONB,
  p_is_shared BOOLEAN,
  p_sort_order INT,
  p_known_updated_at TIMESTAMPTZ
)
RETURNS TABLE (
  list_id UUID,
  conflict BOOLEAN,
  name TEXT,
  rows JSONB,
  placements JSONB,
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
  cur public.user_tier_lists%ROWTYPE;
BEGIN
  -- SECURITY DEFINER bypasses RLS, so require the caller to own the account, like the table policies do.
  IF target_user_id IS DISTINCT FROM
     NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
  THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO cur
  FROM public.user_tier_lists t
  WHERE t.list_id = p_list_id
  FOR UPDATE;

  IF NOT FOUND THEN
    IF (SELECT count(*) FROM public.user_tier_lists t WHERE t.user_id = target_user_id) >= 100 THEN
      RAISE EXCEPTION 'Tier list limit reached';
    END IF;

    INSERT INTO public.user_tier_lists (
      list_id, user_id, name, rows, placements, is_shared, sort_order
    ) VALUES (
      p_list_id, target_user_id, p_name, p_rows, p_placements, p_is_shared, p_sort_order
    )
    RETURNING * INTO cur;

    conflict := false;

  ELSIF cur.user_id <> target_user_id THEN
    -- Someone else's list id. Don't reveal anything about it.
    RAISE EXCEPTION 'Forbidden';

  ELSIF p_known_updated_at IS NULL OR cur.updated_at > p_known_updated_at THEN
    -- Either this client never confirmed a sync of this list, or it changed elsewhere since.
    conflict := true;

  ELSE
    UPDATE public.user_tier_lists t
    SET
      name = p_name,
      rows = p_rows,
      placements = p_placements,
      is_shared = p_is_shared
    WHERE t.list_id = p_list_id
    RETURNING * INTO cur;

    conflict := false;
  END IF;

  list_id := cur.list_id;
  name := cur.name;
  rows := cur.rows;
  placements := cur.placements;
  sort_order := cur.sort_order;
  is_shared := cur.is_shared;
  created_at := cur.created_at;
  updated_at := cur.updated_at;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE
ON FUNCTION public.save_tier_list_safe(UUID, UUID, TEXT, JSONB, JSONB, BOOLEAN, INT, TIMESTAMPTZ)
TO anon, authenticated;

-- =========================================================
-- set_tier_list_order
-- =========================================================
-- SECURITY INVOKER (the default) on purpose: RLS and the column grant above already limit this to
-- the caller's own rows and to sort_order, so there's no extra privilege to guard.

CREATE OR REPLACE FUNCTION public.set_tier_list_order(
  target_user_id UUID,
  ordered_ids UUID[]
)
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE public.user_tier_lists t
  SET sort_order = o.pos - 1
  FROM unnest(ordered_ids) WITH ORDINALITY AS o(id, pos)
  WHERE t.user_id = target_user_id
    AND t.list_id = o.id;
$$;

GRANT EXECUTE
ON FUNCTION public.set_tier_list_order(UUID, UUID[])
TO anon, authenticated;

-- =========================================================
-- get_shared_tier_list
-- =========================================================
-- Public read of one *shared* list by its id. SECURITY DEFINER because user_tier_lists' RLS only lets
-- owners read their rows (same reason get_public_characters is a function). Unshared or unknown ids
-- simply return no rows. is_owner lets the app open your own link in edit mode instead of read-only.

CREATE OR REPLACE FUNCTION public.get_shared_tier_list(
  target_list_id UUID
)
RETURNS TABLE (
  list_id UUID,
  name TEXT,
  rows JSONB,
  placements JSONB,
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
    t.list_id,
    t.name,
    t.rows,
    t.placements,
    t.created_at,
    t.updated_at,
    COALESCE(p.display_name, ''),
    u.friend_id,
    t.user_id IS NOT DISTINCT FROM
      NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid
  FROM public.user_tier_lists t
  JOIN public.users u ON u.user_id = t.user_id
  LEFT JOIN public.user_profiles p ON p.user_id = t.user_id
  WHERE t.list_id = target_list_id
    AND t.is_shared;
$$;

GRANT EXECUTE
ON FUNCTION public.get_shared_tier_list(UUID)
TO anon, authenticated;
