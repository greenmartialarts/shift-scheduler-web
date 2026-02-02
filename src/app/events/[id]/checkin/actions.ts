'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCheckIn(assignmentId: string, checkedIn: boolean, eventId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('assignments')
        .update({ checked_in: checkedIn })
        .eq('id', assignmentId)

    if (error) {
        console.error('Error toggling check-in:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/checkin`, 'page')
    return { success: true }
}

export async function dismissLateWarning(assignmentId: string, eventId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('assignments')
        .update({ late_dismissed: true })
        .eq('id', assignmentId)

    if (error) {
        console.error('Error dismissing late warning:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/checkin`, 'page')
    return { success: true }
}

export async function undismissLateWarning(assignmentId: string, eventId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('assignments')
        .update({ late_dismissed: false })
        .eq('id', assignmentId)

    if (error) {
        console.error('Error undismissing late warning:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/checkin`, 'page')
    return { success: true }
}
