'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ShiftSchema } from '@/lib/schemas'

export async function addShift(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const start = formData.get('start') as string
    const end = formData.get('end') as string

    // Validate with Zod
    const validated = ShiftSchema.safeParse({
        name,
        start_time: start,
        end_time: end,
        required_groups: formData.get('required_groups') as string,
        allowed_groups: formData.get('allowed_groups') as string,
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

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
    } catch {
        // Fallback or error
        console.error("Error parsing groups JSON")
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

export async function bulkAddShifts(eventId: string, shifts: Array<Record<string, unknown>>) {
    const supabase = await createClient()

    const formattedShifts = []

    for (const s of shifts) {
        // Helper function to parse MM/DD/YYYY HH:MM AM/PM format
        const parseDateTime = (dateStr: string): string | null => {
            if (!dateStr) return null
            try {
                // Parse "12/01/2025 08:00 AM" format
                const date = new Date(dateStr)
                if (isNaN(date.getTime())) return null
                return date.toISOString()
            } catch {
                console.error("Error parsing date:", dateStr)
                return null
            }
        }

        const rs = s as Record<string, unknown>
        // Get field values - support both formats (capitalized and lowercase)
        const name = rs.Name || rs.name || rs.Shift || rs.shift
        const startRaw = rs.Start || rs.start_time || rs.start || rs.Begin || rs.begin
        const endRaw = rs.End || rs.end_time || rs.end || rs.Finish || rs.finish
        const groupsRaw = rs.Groups || rs.required_groups

        // Parse dates
        const startTime = parseDateTime(startRaw as string)
        const endTime = parseDateTime(endRaw as string)

        // Parse required_groups: "Delegates:2, Adults:2" -> {"Delegates": 2, "Adults": 2}
        let requiredGroups = {}
        if (groupsRaw) {
            if (typeof groupsRaw === 'object' && !Array.isArray(groupsRaw)) {
                requiredGroups = groupsRaw
            } else {
                try {
                    // Handle both "Delegates:2|Adults:2" and "Delegates:2, Adults:2" formats
                    const separator = (groupsRaw as string).includes('|') ? '|' : ','
                    requiredGroups = (groupsRaw as string).split(separator).reduce((acc: Record<string, number>, item: string) => {
                        const [group, count] = item.split(':')
                        if (group && count) acc[group.trim()] = parseInt(count.trim())
                        return acc
                    }, {})
                } catch {
                    console.error("Error parsing required_groups", groupsRaw)
                }
            }
        }

        // Parse allowed_groups: "Delegates|Adults" -> ["Delegates", "Adults"]
        let allowedGroups: string[] = []
        if (rs.allowed_groups) {
            if (Array.isArray(rs.allowed_groups)) {
                allowedGroups = rs.allowed_groups as string[]
            } else {
                allowedGroups = (rs.allowed_groups as string).split('|').map((g: string) => g.trim())
            }
        }

        // Parse excluded_groups
        let excludedGroups: string[] = []
        if (rs.excluded_groups) {
            if (Array.isArray(rs.excluded_groups)) {
                excludedGroups = rs.excluded_groups as string[]
            } else {
                excludedGroups = (rs.excluded_groups as string).split('|').map((g: string) => g.trim())
            }
        }

        const shiftData = {
            event_id: eventId,
            name: name,
            start_time: startTime,
            end_time: endTime,
            required_groups: requiredGroups,
            allowed_groups: allowedGroups,
            excluded_groups: excludedGroups,
        }

        // Basic validation for bulk import
        if (!startTime || !endTime) {
            console.error("Missing start or end time for shift:", name)
            continue
        }

        if (new Date(endTime) <= new Date(startTime)) {
            console.error("End time before start time for shift:", name)
            continue
        }

        formattedShifts.push(shiftData)
    }

    if (formattedShifts.length === 0) {
        return { error: 'No valid shifts found to import.' }
    }

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

    // Validate with Zod
    const validated = ShiftSchema.safeParse({
        name,
        start_time: start,
        end_time: end,
        required_groups: formData.get('required_groups') as string,
        allowed_groups: formData.get('allowed_groups') as string,
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

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
    } catch {
        console.error("Error parsing groups JSON")
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

export async function generateRecurringShifts(eventId: string, formData: FormData) {
    const supabase = await createClient()

    const templateId = formData.get('template_id') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const startTime = formData.get('start_time') as string
    const endTime = formData.get('end_time') as string
    const days = formData.getAll('days') as string[]

    // Fetch template details
    const { data: template, error: tError } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('id', templateId)
        .single()

    if (tError || !template) {
        return { error: 'Template not found' }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const shiftsToCreate = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay().toString()
        if (days.includes(dayOfWeek)) {
            const shiftStart = new Date(d)
            const [startH, startM] = startTime.split(':')
            shiftStart.setHours(parseInt(startH), parseInt(startM), 0, 0)

            const shiftEnd = new Date(d)
            const [endH, endM] = endTime.split(':')
            shiftEnd.setHours(parseInt(endH), parseInt(endM), 0, 0)

            // Avoid timezone issues by using ISO string slices
            const startISO = new Date(shiftStart.getTime() - shiftStart.getTimezoneOffset() * 60000).toISOString()
            const endISO = new Date(shiftEnd.getTime() - shiftEnd.getTimezoneOffset() * 60000).toISOString()

            shiftsToCreate.push({
                event_id: eventId,
                name: template.name,
                start_time: startISO,
                end_time: endISO,
                required_groups: template.required_groups,
                allowed_groups: template.allowed_groups || [],
            })
        }
    }

    if (shiftsToCreate.length === 0) {
        return { error: 'No dates matched the selection' }
    }

    const { error: iError } = await supabase.from('shifts').insert(shiftsToCreate)

    if (iError) {
        console.error('Error generating shifts:', iError)
        return { error: iError.message }
    }

    revalidatePath(`/events/${eventId}/shifts`)
    return { success: true }
}
