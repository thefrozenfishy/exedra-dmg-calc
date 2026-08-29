import { getSupabase } from './supabase'
import { getUserId } from '../store/user'

let isLoggingEvent = false

export async function logEvent(event: string, metadata: any = {}) {
    if (isLoggingEvent) return

    isLoggingEvent = true

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

        if (error) {
            console.warn('Analytics insert failed', error)
        }
    } catch (err) {
        console.warn('Analytics error', err)
    } finally {
        isLoggingEvent = false
    }
}

export default logEvent
