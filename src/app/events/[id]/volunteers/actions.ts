'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVolunteer(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const group = formData.get('group') as string
    const maxHours = parseFloat(formData.get('max_hours') as string) || null

    const { error } = await supabase.from('volunteers').insert({
        event_id: eventId,
        name,
        group,
        max_hours: maxHours,
    })

    if (error) {
        console.error('Error adding volunteer:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/volunteers`)
    return { success: true }
}

export async function bulkAddVolunteers(eventId: string, volunteers: any[]) {
    const supabase = await createClient()

    const { error } = await supabase.from('volunteers').insert(
        volunteers.map((v) => ({
            event_id: eventId,
            name: v.name,
            group: v.group,
            max_hours: v.max_hours ? parseFloat(v.max_hours) : null,
        }))
    )

    if (error) {
        console.error('Error bulk adding volunteers:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/volunteers`)
    return { success: true }
}

export async function deleteVolunteer(eventId: string, volunteerId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', volunteerId)

    if (error) {
        console.error('Error deleting volunteer:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/volunteers`)
    return { success: true }
}

export async function updateVolunteer(eventId: string, volunteerId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const group = formData.get('group') as string
    const maxHours = parseFloat(formData.get('max_hours') as string) || null

    const { error } = await supabase
        .from('volunteers')
        .update({
            name,
            group,
            max_hours: maxHours,
        })
        .eq('id', volunteerId)

    if (error) {
        console.error('Error updating volunteer:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/volunteers`)
    return { success: true }
}

export async function deleteAllVolunteers(eventId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('event_id', eventId)

    if (error) {
        console.error('Error deleting all volunteers:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/volunteers`)
    return { success: true }
}
