export interface TierRow {
    id: string
    label: string
    color: string
}

export interface SavedTierList {
    id: string
    name: string
    rows: TierRow[]
    placements: Record<string, number[]>
    /** Anyone holding the link may view this list. Only takes effect once the list has synced to the cloud. */
    shared?: boolean
    createdAt: number
    updatedAt: number
}

/** A row of `public.user_tier_lists` as PostgREST returns it. `rows`/`placements` are untrusted JSON. */
export interface TierListRow {
    list_id: string
    name: string
    rows: unknown
    placements: unknown
    sort_order: number
    is_shared: boolean
    created_at: string
    updated_at: string
}

/** What `get_shared_tier_list` returns, already sanitized. */
export interface SharedTierList {
    list: SavedTierList
    ownerName: string
    ownerFriendId: string | null
    /** The viewer is the one who owns this list. */
    isOwner: boolean
}

/** What we remember about the last successful sync of one list. */
export interface SyncMeta {
    /** The server's `updated_at` for the list, kept as an opaque string (JS Dates can't hold microseconds). */
    server: string
    /** The local `updatedAt` that was sent, so later edits show up as "dirty". */
    local: number
}
