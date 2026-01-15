'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTemplate(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const duration_hours = parseFloat(formData.get('duration_hours') as string)
    const required_groups_str = formData.get('required_groups') as string
    const allowed_groups_str = formData.get('allowed_groups') as string

    let required_groups = {}
    try {
        if (required_groups_str) required_groups = JSON.parse(required_groups_str)
    } catch {
        return { error: 'Invalid JSON for required groups' }
    }

    let allowed_groups = []
    try {
        if (allowed_groups_str) allowed_groups = JSON.parse(allowed_groups_str)
    } catch {
        return { error: 'Invalid JSON for allowed groups' }
    }

    const { error } = await supabase.from('shift_templates').insert({
        user_id: user.id,
        name,
        description,
        duration_hours,
        required_groups,
        allowed_groups,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/events/[id]/shifts/templates', 'page')
    revalidatePath('/events/[id]/shifts', 'page')
    return { success: true }
}

export async function deleteTemplate(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase.from('shift_templates').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/events/[id]/shifts/templates', 'page')
    revalidatePath('/events/[id]/shifts', 'page')
    return { success: true }
}
