# External API: a player's saved kioku roster

For other sites that already ship the game's master data (`getStyleMstList.json`, `getCardMstList.json`, ...) and only
need the part tied to a player: their saved kioku and their friend ID.

The data is public. Anyone who knows a friend code can read that roster, exactly like the toolbox's friend view.
There is no login and no token, and nothing private (settings, friends list, saved teams, tier lists) is reachable.

## Call

One Supabase RPC, `export_characters_v1`, with the toolbox's public (publishable) Supabase key. That key ships in
the toolbox's web bundle; ask the toolbox owner for it and the project URL rather than scraping them.

```bash
curl -X POST "https://<project>.supabase.co/rest/v1/rpc/export_characters_v1" \
  -H "apikey: <publishable key>" \
  -H "Content-Type: application/json" \
  -d '{"target_friend_id": "ABCDE"}'
```

```js
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/export_characters_v1`, {
  method: "POST",
  headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ target_friend_id: friendCode }),
})
const roster = await res.json() // null when the friend code doesn't exist
```

The friend code is case-insensitive and surrounding spaces are ignored. Browsers can call this directly (CORS is open).

## Response

`null` for an unknown friend code, otherwise:

```json
{
  "version": 1,
  "friend_id": "ABCDE",
  "updated_at": "2026-11-10T14:21:29.075845+00:00",
  "characters": [
    {
      "character_id": 1020101,
      "enabled": true,
      "dupes": 2,
      "ascension": 0,
      "kioku_lvl": 1,
      "magic_lvl": 1,
      "heartphial_lvl": 1,
      "special_lvl": 1,
      "portrait": "The Savior's Apostle",
      "crys_options": { "123": { "enabled": true, "useIndex": 1, "subCrys": [4, 5] } },
      "updated_at": "2026-11-10T14:21:29.075845+00:00"
    }
  ]
}
```

| field | meaning |
|---|---|
| `version` | Always `1` for this function. |
| `friend_id` | The player's 5-character friend code, upper case. |
| `updated_at` | Newest change to any character row; `null` for an empty roster. Use it to skip re-imports. |
| `characters` | One entry per kioku the player has saved, ordered by `character_id`. |
| `character_id` | `getStyleMstList.styleMstId`. |
| `enabled` | Whether the player has the kioku marked as owned in the toolbox. |
| `dupes` / `ascension` | Duplicate count and ascension level. |
| `kioku_lvl`, `magic_lvl`, `heartphial_lvl`, `special_lvl` | Kioku level, ability (magic) level, heartphial level, ultimate (special) level. |
| `portrait` | Equipped portrait by **name** (`getCardMstList.name`), `null` when none. |
| `crys_options` | The player's crystalis, keyed by crystalis id, as the toolbox stores them. `useIndex` > 0 means equipped (0 = not equipped); `subCrys`: chosen sub-crys ids; `enabled`: the toolbox's own toggle. Other toolbox-only keys (e.g. `locked`) can appear; ignore them. |

## Stability

The shape above is fixed for `export_characters_v1`. New fields may be added; nothing is renamed or removed. A
breaking change ships as `export_characters_v2`, and v1 keeps working until consumers have moved. Don't build on
`get_public_characters`: that one belongs to the toolbox's own pages and changes with them.

Source: `supabase/migrations/0027_external_characters_v1.sql`.
