import { getSupabase } from './supabase'
import { getUserId } from '../store/user'

export async function logEvent(event: string, metadata: any = {}) {
    try {
        const supabase = getSupabase()
        let user_id = getUserId()
        if (user_id == null) {
            user_id = localStorage.getItem("tempUUID")
            if (user_id == null) {
                user_id = crypto.randomUUID()
                localStorage.setItem("tempUUID", user_id)
            }
        }
        const { error } = await supabase.from('analytics').insert([{ user_id, event, metadata }])

        if (error) console.error('Analytics insert failed', error)
    } catch (err) {
        console.error('Analytics error', err)
    }
}

export default logEvent
