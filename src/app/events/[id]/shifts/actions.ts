'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addShift(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const start = formData.get('start') as string
    const end = formData.get('end') as string

    // Parse groups from form data (assuming simple text input for now, or handled in client)
    // For simplicity in the "barebones" version, we'll accept JSON strings or handle parsing in client before sending?
    // Actually, FormData is tricky for complex objects. Let's assume the client sends JSON strings for these fields if using FormData,
    // or we can use a separate server action that takes an object.
    // But to keep it consistent with the previous pattern, let's try to parse.

    const requiredGroupsRaw = formData.get('required_groups') as string
    const allowedGroupsRaw = formData.get('allowed_groups') as string

    let requiredGroups = {}
    let allowedGroups: string[] = []

    try {
        if (requiredGroupsRaw) requiredGroups = JSON.parse(requiredGroupsRaw)
        if (allowedGroupsRaw) allowedGroups = JSON.parse(allowedGroupsRaw)
    } catch (e) {
        // Fallback or error
        console.error("Error parsing groups JSON", e)
    }

    const { error } = await supabase.from('shifts').insert({
        event_id: eventId,
        name: name,
        start_time: start,
        end_time: end,
        required_groups: requiredGroups,
        allowed_groups: allowedGroups,
    })

    if (error) {
        console.error('Error adding shift:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/shifts`)
    return { success: true }
}

export async function bulkAddShifts(eventId: string, shifts: any[]) {
    const supabase = await createClient()

    const formattedShifts = shifts.map((s) => {
        // Parse required_groups: "Delegates:1|Adults:1" -> {"Delegates": 1, "Adults": 1}
        // Parse required_groups: "Delegates:1|Adults:1" -> {"Delegates": 1, "Adults": 1}
        let requiredGroups = {}
        if (s.required_groups) {
            if (typeof s.required_groups === 'object') {
                requiredGroups = s.required_groups
            } else {
                try {
                    requiredGroups = s.required_groups.split('|').reduce((acc: any, item: string) => {
                        const [group, count] = item.split(':')
                        if (group && count) acc[group.trim()] = parseInt(count)
                        return acc
                    }, {})
                } catch (e) {
                    console.error("Error parsing required_groups", s.required_groups)
                }
            }
        }

        // Parse allowed_groups: "Delegates|Adults" -> ["Delegates", "Adults"]
        let allowedGroups: string[] = []
        if (s.allowed_groups) {
            if (Array.isArray(s.allowed_groups)) {
                allowedGroups = s.allowed_groups
            } else {
                allowedGroups = s.allowed_groups.split('|').map((g: string) => g.trim())
            }
        }

        // Parse excluded_groups
        let excludedGroups: string[] = []
        if (s.excluded_groups) {
            if (Array.isArray(s.excluded_groups)) {
                excludedGroups = s.excluded_groups
            } else {
                excludedGroups = s.excluded_groups.split('|').map((g: string) => g.trim())
            }
        }

        return {
            event_id: eventId,
            name: s.name,
            start_time: s.start,
            end_time: s.end,
            required_groups: requiredGroups,
            allowed_groups: allowedGroups,
            excluded_groups: excludedGroups,
        }
    })

    const { error } = await supabase.from('shifts').insert(formattedShifts)

    if (error) {
        console.error('Error bulk adding shifts:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/shifts`)
    return { success: true }
}

export async function deleteShift(eventId: string, shiftId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId)

    if (error) {
        console.error('Error deleting shift:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/shifts`)
    return { success: true }
}

export async function updateShift(eventId: string, shiftId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const start = formData.get('start') as string
    const end = formData.get('end') as string
    const requiredGroupsRaw = formData.get('required_groups') as string
    const allowedGroupsRaw = formData.get('allowed_groups') as string
    const excludedGroupsRaw = formData.get('excluded_groups') as string

    let requiredGroups = {}
    let allowedGroups: string[] = []
    let excludedGroups: string[] = []

    try {
        if (requiredGroupsRaw) requiredGroups = JSON.parse(requiredGroupsRaw)
        if (allowedGroupsRaw) allowedGroups = JSON.parse(allowedGroupsRaw)
        if (excludedGroupsRaw) excludedGroups = JSON.parse(excludedGroupsRaw)
    } catch (e) {
        console.error("Error parsing groups JSON", e)
    }

    const { error } = await supabase
        .from('shifts')
        .update({
            name,
            start_time: start,
            end_time: end,
            required_groups: requiredGroups,
            allowed_groups: allowedGroups,
            excluded_groups: excludedGroups,
        })
        .eq('id', shiftId)

    if (error) {
        console.error('Error updating shift:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/shifts`)
    return { success: true }
}

export async function deleteAllShifts(eventId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('event_id', eventId)

    if (error) {
        console.error('Error deleting all shifts:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/shifts`)
    return { success: true }
}
