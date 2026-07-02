import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { getUserId } from '../store/user'

let cachedClient: SupabaseClient | null = null
let cachedUserId: string | null = null

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
