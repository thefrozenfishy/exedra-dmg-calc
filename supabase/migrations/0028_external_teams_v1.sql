-- Migration: stable read API for a player's saved PvP and PvE teams (docs/openapi.yaml, docs/EXTERNAL_API.md).
--
-- export_teams_v1(friend code) returns every PvP and PvE Simulator team the player has synced to the cloud,
-- shared or not, as one JSON document. This is a deliberate change from 0023: teams used to be private unless
-- the owner turned on link sharing, and friend codes are public (leaderboard, unions), so anyone can now read
-- any player's PvP/PvE teams. Single Battle Calculator teams (kind 'single') stay private.
--
-- Same contract rules as export_characters_v1 (0027): the shape is frozen, new fields may be added, a breaking
-- change ships as export_teams_v2.
--
-- `slots` and `extra` are passed through as stored. The toolbox writes them sanitized, but the table only bounds
-- their size (0023/0024), so consumers must validate them.
--
-- Response (unknown friend code -> NULL):
--   {
--     "version": 1,
--     "friend_id": "ABCDE",
--     "teams": [                       -- pvp first, then pve; each in the owner's order
--       { "team_id": "<uuid>", "kind": "pvp" | "pve", "name": "...", "is_shared": false, "sort_order": 0,
--         "created_at": "...", "updated_at": "...",
--         "slots": [[slot x5], ...],     -- pvp: [enemy team, allied team]; pve: [team]
--         "extra": { ... } | null }      -- pve: simulator setup (src/utils/pveSetup.ts PvESetup); pvp: null
--     ]
--   }

CREATE OR REPLACE FUNCTION public.export_teams_v1(
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
    'teams', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'team_id', t.team_id,
          'kind', t.kind,
          'name', t.name,
          'is_shared', t.is_shared,
          'sort_order', t.sort_order,
          'created_at', t.created_at,
          'updated_at', t.updated_at,
          'slots', COALESCE(t.data->'slots', '[]'::jsonb),
          'extra', t.data->'extra'
        )
        ORDER BY CASE t.kind WHEN 'pvp' THEN 0 ELSE 1 END, t.sort_order, t.created_at
      )
      FROM public.user_saved_teams t
      WHERE t.user_id = u.user_id
        AND t.kind IN ('pvp', 'pve')
    ), '[]'::jsonb)
  )
  FROM public.users u
  WHERE u.friend_id = upper(trim(target_friend_id));
$$;

GRANT EXECUTE
ON FUNCTION public.export_teams_v1(TEXT)
TO anon, authenticated, service_role;
