# External API: a player's saved kioku and teams

For other sites that already ship the game's master data (`getStyleMstList.json`, `getCardMstList.json`, ...) and
only need what a player saved in the toolbox. The full contract (every field, examples, errors) is the OpenAPI
spec: [`openapi.yaml`](openapi.yaml). Load it in any OpenAPI viewer (Swagger Editor, Redocly, Postman) to browse it.

| Endpoint | Returns |
|---|---|
| `GET /rest/v1/rpc/export_characters_v1?target_friend_id=ABCDE` | The player's friend ID and every saved kioku with its build. |
| `GET /rest/v1/rpc/export_teams_v1?target_friend_id=ABCDE` | The player's friend ID and every PvP and PvE Simulator team, shared by link or not. |

Both need the toolbox's public (publishable) Supabase key in the `apikey` header and nothing else: no login.
Anyone who knows a friend code can read both, so nothing else (settings, friends list, tier lists, Single Battle
teams) is exposed. A malformed friend code returns `400`, an unknown one `404`, both with a JSON
`{code, message}` body (`EXD400` / `EXD404`).

```bash
curl "https://hqutdzugcelwjooqwpst.supabase.co/rest/v1/rpc/export_teams_v1?target_friend_id=ABCDE" \
  -H "apikey: sb_publishable_..."
```

```js
const SUPABASE_URL = "https://hqutdzugcelwjooqwpst.supabase.co"
const SUPABASE_KEY = "sb_publishable_..." // the toolbox's publishable key

const get = async (fn, friendCode) => {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fn}?target_friend_id=${encodeURIComponent(friendCode)}`
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY } })
  if (res.status === 404) return null // no player has this friend code
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${await res.text()}`)
  return res.json()
}
const roster = await get("export_characters_v1", "ABCDE")
const teams = await get("export_teams_v1", "ABCDE")
```

Ask the toolbox owner for the publishable key (`sb_publishable_...`) rather than scraping it from the web bundle.

## Reading the data with the master data

- `character_id` (roster) and `id` (team members) are `getStyleMstList.styleMstId`.
- `portrait` is the portrait's **name** (`getCardMstList.name`), not an id.
- `crys_options` / `crysOptions` are keyed by crystalis id; `useIndex` > 0 means equipped.
- PvP `slots` is `[enemy team, allied team]`; PvE `slots` is `[team]`; each team is 5 slots, empty ones `{}`.
- PvE `extra.stageId` is `getQuestStageMstList.questStageMstId`.
- Team `slots` and `extra` are passed through as stored, so validate them.

## Stability

The `v1` shapes are frozen. New fields may be added (ignore unknown ones); nothing is renamed or removed. A breaking
change ships as `export_characters_v2` / `export_teams_v2`, and v1 keeps working until consumers have moved. Don't
build on `get_public_characters` or `get_shared_team`: those belong to the toolbox's own pages and change with them.

Source: `supabase/migrations/0027_external_characters_v1.sql`, `supabase/migrations/0028_external_teams_v1.sql`.
When either function changes, update `openapi.yaml` in the same commit.
