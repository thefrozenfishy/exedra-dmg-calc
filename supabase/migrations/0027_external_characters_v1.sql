-- Migration: stable read API for external sites (docs/openapi.yaml, docs/EXTERNAL_API.md).
--
--   GET /rest/v1/rpc/export_characters_v1?target_friend_id=ABCDE
--
-- Returns one player's friend ID and saved kioku roster as a single JSON document. It exposes nothing new: the
-- same rows are already public through get_public_characters (the app's friend view). The difference is the
-- contract. get_public_characters belongs to this app and changes with it (0010 dropped crys/crys_sub and added
-- crys_options); this function's shape is frozen. New fields may be added; a breaking change ships as
-- export_characters_v2, with v1 kept until the external consumers have moved.
--
-- Errors use PostgREST's raise-PGRST mechanism, so they come back as real HTTP statuses with a JSON body
-- ({code, message, details, hint}):
--   400 EXD400  target_friend_id missing or not 5 letters/digits
--   404 EXD404  no player has that friend code
-- The parameter has a DEFAULT so a request without it reaches the function (and gets the 400) instead of
-- PostgREST's own "function not found" 404.
--
-- STABLE, so PostgREST serves it on GET (read-only transaction). It also answers POST, as every RPC does, but
-- the documented API is GET only.
--
-- Response:
--   {
--     "version": 1,
--     "friend_id": "ABCDE",
--     "updated_at": "...",            -- newest character row, NULL if the roster is empty
--     "characters": [                 -- ordered by character_id
--       { "character_id": 1010101,    -- getStyleMstList.styleMstId
--         "enabled": true, "dupes": 0, "ascension": 0,
--         "kioku_lvl": 1, "magic_lvl": 1, "heartphial_lvl": 1, "special_lvl": 1,
--         "portrait": "...",          -- getCardMstList name, NULL when none
--         "crys_options": { "<crystalis id>": { "enabled": .., "useIndex": .., "subCrys": [..] } },
--         "updated_at": "..." }
--     ]
--   }

-- =========================================================
-- Shared helpers for the external API functions
-- =========================================================

-- Raises an error PostgREST answers with the given HTTP status and a {code, message} JSON body.
CREATE OR REPLACE FUNCTION public.api_raise(p_status INT, p_code TEXT, p_message TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE SQLSTATE 'PGRST' USING
    MESSAGE = json_build_object('code', p_code, 'message', p_message, 'details', NULL, 'hint', NULL)::text,
    DETAIL = json_build_object('status', p_status, 'headers', json_build_object())::text;
END;
$$;

-- The account behind a friend code from a request: 400 if malformed, 404 if unknown.
CREATE OR REPLACE FUNCTION public.api_resolve_friend_id(target_friend_id TEXT)
RETURNS public.users
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT := upper(trim(COALESCE(target_friend_id, '')));
  player public.users;
BEGIN
  IF code !~ '^[A-Z0-9]{5}$' THEN
    PERFORM public.api_raise(400, 'EXD400', 'target_friend_id must be a 5-character friend code');
  END IF;

  SELECT * INTO player FROM public.users u WHERE u.friend_id = code;

  IF NOT FOUND THEN
    PERFORM public.api_raise(404, 'EXD404', format('No player has friend code %s', code));
  END IF;

  RETURN player;
END;
$$;

-- Internal only: not part of the API (the second one returns the account id, which is a credential).
REVOKE EXECUTE ON FUNCTION public.api_raise(INT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.api_resolve_friend_id(TEXT) FROM PUBLIC, anon, authenticated;

-- =========================================================
-- export_characters_v1
-- =========================================================

CREATE OR REPLACE FUNCTION public.export_characters_v1(
  target_friend_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  player public.users := public.api_resolve_friend_id(target_friend_id);
BEGIN
  RETURN jsonb_build_object(
    'version', 1,
    'friend_id', player.friend_id::text,
    'updated_at', (
      SELECT max(uc.updated_at) FROM public.user_characters uc WHERE uc.user_id = player.user_id
    ),
    'characters', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'character_id', uc.character_id,
          'enabled', uc.enabled,
          'dupes', uc.dupes,
          'ascension', uc.ascension,
          'kioku_lvl', uc.kioku_lvl,
          'magic_lvl', uc.magic_lvl,
          'heartphial_lvl', uc.heartphial_lvl,
          'special_lvl', uc.special_lvl,
          'portrait', NULLIF(uc.portrait, ''),
          'crys_options', uc.crys_options,
          'updated_at', uc.updated_at
        )
        ORDER BY uc.character_id
      )
      FROM public.user_characters uc
      WHERE uc.user_id = player.user_id
    ), '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE
ON FUNCTION public.export_characters_v1(TEXT)
TO anon, authenticated, service_role;
