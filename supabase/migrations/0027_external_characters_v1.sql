-- Migration: stable read API for external sites (docs/EXTERNAL_API.md).
--
-- export_characters_v1(friend code) returns one player's saved kioku roster as a single JSON document.
-- It exposes nothing new: the same rows are already public through get_public_characters (the app's friend
-- view). The difference is the contract. get_public_characters belongs to this app and changes with it
-- (0010 dropped crys/crys_sub and added crys_options); this function's shape is frozen. A breaking change
-- means a new export_characters_v2, with v1 kept until the external consumers have moved.
--
-- Response (unknown friend code -> NULL):
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

CREATE OR REPLACE FUNCTION public.export_characters_v1(
  target_friend_id TEXT
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'version', 1,
    'friend_id', u.friend_id::text,
    'updated_at', (
      SELECT max(uc.updated_at) FROM public.user_characters uc WHERE uc.user_id = u.user_id
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
      WHERE uc.user_id = u.user_id
    ), '[]'::jsonb)
  )
  FROM public.users u
  WHERE u.friend_id = upper(trim(target_friend_id));
$$;

GRANT EXECUTE
ON FUNCTION public.export_characters_v1(TEXT)
TO anon, authenticated, service_role;
