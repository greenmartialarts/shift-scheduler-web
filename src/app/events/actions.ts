'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error } = await supabase.from('events').insert({
        name,
        user_id: user.id,
        date: new Date().toISOString(), // Default to today for now
    })

    if (error) {
        console.error('Error creating event:', error)
        // Handle error (e.g., return state to display)
    }

    revalidatePath('/events')
}

export async function deleteEvent(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
        console.error('Error deleting event:', error)
    }

    revalidatePath('/events')
}
