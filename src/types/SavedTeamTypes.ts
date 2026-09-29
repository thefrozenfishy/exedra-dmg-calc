import type { CrystalisSelection } from "./KiokuTypes"

/** Which simulator a saved team belongs to. `single` holds one team, `pvp` holds [enemy team, allied team]. */
export type SavedTeamKind = "single" | "pvp"

/** The per-team parts of a Character; everything else (name, element, role, ...) comes from the game data. */
export interface SavedTeamMember {
    id: number
    ascension: number
    kiokuLvl: number
    magicLvl: number
    heartphialLvl: number
    specialLvl: number
    portrait?: string
    crysOptions: Record<string, CrystalisSelection>
}

export interface SavedTeamSlot {
    main?: SavedTeamMember
    support?: SavedTeamMember
    buffMultReduction?: number
    debuffMultReduction?: number
}

export interface SavedTeam {
    id: string
    name: string
    /** One array of 5 slots per team. */
    slots: SavedTeamSlot[][]
    /** Anyone holding the link may view this team. Only takes effect once the team has synced to the cloud. */
    shared?: boolean
    createdAt: number
    updatedAt: number
}

/** A row of `public.user_saved_teams`, with `team_id` exposed as `list_id` for the shared sync code. `data` is untrusted JSON. */
export interface SavedTeamRow {
    list_id: string
    kind: string
    name: string
    data: unknown
    sort_order: number
    is_shared: boolean
    created_at: string
    updated_at: string
}

/** What `get_shared_team` returns, already sanitized. */
export interface SharedTeam {
    team: SavedTeam
    kind: SavedTeamKind
    ownerName: string
    ownerFriendId: string | null
    isOwner: boolean
}
