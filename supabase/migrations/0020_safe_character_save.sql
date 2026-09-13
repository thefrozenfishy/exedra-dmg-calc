-- Migration: row-level optimistic concurrency for character saves.
--
-- Previously the client did a plain `.from('user_characters').upsert(rows)`
-- of every character on every save. That's a blind last-write-wins
-- overwrite of the whole account: if a client's local copy was stale (e.g.
-- a second tab/device that hadn't caught up with a change made elsewhere),
-- saving from it would silently revert that change, with nothing in
-- Postgres to say so - the write itself always succeeds.
--
-- save_characters_safe fixes this per character row, not per whole save:
-- the caller sends the `updated_at` it last confirmed for each character
-- alongside the new values. A row is only written if that token still
-- matches (or the row doesn't exist yet, i.e. a genuinely new character).
-- If the DB's `updated_at` for that row is newer than what the caller
-- last saw - or the caller never confirmed a sync for it at all - the
-- write for *that row* is rejected and the DB's current value is returned
-- instead, leaving every other row in the same call unaffected.
--
-- `user_characters.updated_at` and its BEFORE UPDATE trigger already exist
-- from 0001, so no schema change is needed here, just this function.

CREATE OR REPLACE FUNCTION public.save_characters_safe(
  target_user_id UUID,
  payload JSONB -- array of {character_id, enabled, dupes, ascension, kioku_lvl, magic_lvl, heartphial_lvl, special_lvl, portrait, crys_options, known_updated_at}
)
RETURNS TABLE (
  character_id BIGINT,
  conflict BOOLEAN,
  enabled BOOLEAN,
  dupes INT,
  ascension INT,
  kioku_lvl INT,
  magic_lvl INT,
  heartphial_lvl INT,
  special_lvl INT,
  portrait TEXT,
  crys_options JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
  cur public.user_characters%ROWTYPE;
  known TIMESTAMPTZ;
BEGIN
  -- This function is SECURITY DEFINER (it needs to bypass RLS to report
  -- back conflicting rows the same way a normal upsert's RLS policy would
  -- otherwise just silently restrict to target_user_id anyway) - so, same
  -- as the existing RLS policies on this table, require the caller to own
  -- the account they're writing to.
  IF target_user_id IS DISTINCT FROM
     (current_setting('request.headers', true)::json->>'x-user-id')::uuid
  THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(payload)
  LOOP
    SELECT * INTO cur
    FROM public.user_characters uc
    WHERE uc.user_id = target_user_id
      AND uc.character_id = (item->>'character_id')::bigint
    FOR UPDATE;

    known := NULLIF(item->>'known_updated_at', '')::timestamptz;

    IF NOT FOUND THEN
      -- No row yet for this character - nothing to conflict with.
      INSERT INTO public.user_characters (
        user_id, character_id, enabled, dupes, ascension,
        kioku_lvl, magic_lvl, heartphial_lvl, special_lvl,
        portrait, crys_options
      ) VALUES (
        target_user_id,
        (item->>'character_id')::bigint,
        (item->>'enabled')::boolean,
        (item->>'dupes')::int,
        (item->>'ascension')::int,
        (item->>'kioku_lvl')::int,
        (item->>'magic_lvl')::int,
        (item->>'heartphial_lvl')::int,
        (item->>'special_lvl')::int,
        item->>'portrait',
        COALESCE(item->'crys_options', '{}'::jsonb)
      )
      RETURNING * INTO cur;

      character_id := cur.character_id;
      conflict := false;

    ELSIF known IS NULL OR cur.updated_at > known THEN
      -- Either this client never confirmed a sync for this row, or someone
      -- else wrote to it more recently than what this client last saw.
      -- Reject the incoming value; hand back what's actually in the DB so
      -- the caller can reconcile instead of clobbering it.
      character_id := cur.character_id;
      conflict := true;

    ELSE
      UPDATE public.user_characters uc
      SET
        enabled = (item->>'enabled')::boolean,
        dupes = (item->>'dupes')::int,
        ascension = (item->>'ascension')::int,
        kioku_lvl = (item->>'kioku_lvl')::int,
        magic_lvl = (item->>'magic_lvl')::int,
        heartphial_lvl = (item->>'heartphial_lvl')::int,
        special_lvl = (item->>'special_lvl')::int,
        portrait = item->>'portrait',
        crys_options = COALESCE(item->'crys_options', '{}'::jsonb)
      WHERE uc.user_id = target_user_id
        AND uc.character_id = (item->>'character_id')::bigint
      RETURNING * INTO cur;

      character_id := cur.character_id;
      conflict := false;
    END IF;

    enabled := cur.enabled;
    dupes := cur.dupes;
    ascension := cur.ascension;
    kioku_lvl := cur.kioku_lvl;
    magic_lvl := cur.magic_lvl;
    heartphial_lvl := cur.heartphial_lvl;
    special_lvl := cur.special_lvl;
    portrait := cur.portrait;
    crys_options := cur.crys_options;
    updated_at := cur.updated_at;

    RETURN NEXT;
  END LOOP;
END;
$$;

GRANT EXECUTE
ON FUNCTION public.save_characters_safe(UUID, JSONB)
TO anon, authenticated;
