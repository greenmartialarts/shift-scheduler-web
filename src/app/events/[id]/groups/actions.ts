'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGroup(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string
    const description = formData.get('description') as string
    const max_hours_default = parseFloat(formData.get('max_hours_default') as string) || null

    const { error } = await supabase.from('volunteer_groups').insert({
        event_id: eventId,
        name,
        color,
        description,
        max_hours_default,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/groups`, 'page')
    revalidatePath(`/events/${eventId}/volunteers`, 'page')
    return { success: true }
}

export async function deleteGroup(eventId: string, id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check if volunteers are assigned to this group?
    // The foreign key might prevent deletion or set to null depending on schema.
    // I didn't specify ON DELETE for the FK in volunteers, so it defaults to NO ACTION (error).
    // So we should probably check or handle error.

    const { error } = await supabase.from('volunteer_groups').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/groups`, 'page')
    revalidatePath(`/events/${eventId}/volunteers`, 'page')
    return { success: true }
}

export async function updateGroup(eventId: string, id: string, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string
    const description = formData.get('description') as string
    const max_hours_default = parseFloat(formData.get('max_hours_default') as string) || null

    const { error } = await supabase.from('volunteer_groups').update({
        name,
        color,
        description,
        max_hours_default,
    }).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/groups`, 'page')
    revalidatePath(`/events/${eventId}/volunteers`, 'page')
    return { success: true }
}
