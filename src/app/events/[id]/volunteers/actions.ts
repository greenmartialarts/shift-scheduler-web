'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVolunteer(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const group = formData.get('group') as string
    const maxHours = parseFloat(formData.get('max_hours') as string) || null
    const phone = formData.get('phone') as string || null
    const email = formData.get('email') as string || null

    const { error } = await supabase.from('volunteers').insert({
        event_id: eventId,
        name,
        group,
        max_hours: maxHours,
        phone,
        email,
    })

    if (error) {
        console.error('Error adding volunteer:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/volunteers`)
    return { success: true }
}

export async function bulkAddVolunteers(eventId: string, volunteers: Array<Record<string, unknown>>) {
    const supabase = await createClient()

    const { error } = await supabase.from('volunteers').insert(
        volunteers.map((v) => {
            const rv = v as Record<string, unknown>
            return {
                event_id: eventId,
                name: (rv.name || rv.Name) as string,
                group: (rv.group || rv.Group) as string | null,
                max_hours: (rv.max_hours || rv.MaxHours) ? parseFloat((rv.max_hours || rv.MaxHours) as string) : null,
                phone: (rv.phone || rv.Phone || null) as string | null,
                email: (rv.email || rv.Email || null) as string | null,
            }
        })
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
    const phone = formData.get('phone') as string || null
    const email = formData.get('email') as string || null

    const { error } = await supabase
        .from('volunteers')
        .update({
            name,
            group,
            max_hours: maxHours,
            phone,
            email,
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
