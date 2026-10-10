import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { getUserId } from '../store/user'

let cachedClient: SupabaseClient | null = null
let cachedUserId: string | null = null

let cachedKanbanClient: SupabaseClient | null = null
let cachedKanbanId: string | null = null

/**
 * Kanban board identity: the cloud account id, or, without an account, the browser's tempUUID (which is what
 * createUserId turns into the account id later), so people without an account can still edit their own cards.
 */
export function getKanbanUserId(): string {
    const userId = getUserId()
    if (userId) return userId
    let temp = localStorage.getItem("tempUUID")
    if (!temp) {
        temp = crypto.randomUUID()
        localStorage.setItem("tempUUID", temp)
    }
    return temp
}

export function getKanbanSupabase() {
    const id = getKanbanUserId()
    if (id === getUserId()) return getSupabase()

    if (!cachedKanbanClient || cachedKanbanId !== id) {
        cachedKanbanClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            { global: { headers: { 'x-user-id': id } } }
        )
        cachedKanbanId = id
    }
    return cachedKanbanClient
}

export function getSupabase() {
    const userId = getUserId()

    if (!cachedClient || cachedUserId !== userId) {
        cachedClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            {
                global: {
                    headers: {
                        'x-user-id': userId ?? ''
                    }
                }
            }
        )
        cachedUserId = userId
    }

    return cachedClient
}
