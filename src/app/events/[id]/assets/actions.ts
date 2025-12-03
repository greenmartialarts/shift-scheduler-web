'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAsset(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const identifier = formData.get('identifier') as string
    const status = formData.get('status') as string || 'available'

    const { error } = await supabase.from('assets').insert({
        event_id: eventId,
        name,
        type,
        identifier,
        status,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/assets`, 'page')
    return { success: true }
}

export async function updateAsset(eventId: string, id: string, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const identifier = formData.get('identifier') as string
    const status = formData.get('status') as string

    const { error } = await supabase.from('assets').update({
        name,
        type,
        identifier,
        status,
    }).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/assets`, 'page')
    return { success: true }
}

export async function deleteAsset(eventId: string, id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase.from('assets').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/assets`, 'page')
    return { success: true }
}
