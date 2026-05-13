import { createClient } from "@supabase/supabase-js"
import { getUserId } from '../store/user'

export function getSupabase() {
    const userId = getUserId()

    return createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
            global: {
                headers: {
                    'x-user-id': userId ?? ''
                }
            }
        })
}