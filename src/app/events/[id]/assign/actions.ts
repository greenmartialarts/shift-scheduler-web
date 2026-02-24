'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignVolunteer(shiftId: string, volunteerId: string) {
    const supabase = await createClient()

    // Check if this volunteer is already assigned to this shift
    const { data: existing } = await supabase
        .from('assignments')
        .select('id')
        .eq('shift_id', shiftId)
        .eq('volunteer_id', volunteerId)
        .maybeSingle()

    if (existing) {
        return { error: 'This volunteer is already assigned to this shift.' }
    }

    // Check for overstaffing and get event_id for revalidation
    const { data: shift } = await supabase
        .from('shifts')
        .select('event_id, required_groups, assignments(id)')
        .eq('id', shiftId)
        .single()

    let overstaffed = false
    const eventId = shift?.event_id
    if (shift) {
        const requiredGroups = normalizeGroups(shift.required_groups)
        const totalRequired = Object.values(requiredGroups).reduce((sum, count) => sum + Number(count), 0)
        const currentAssignments = shift.assignments?.length || 0

        if (currentAssignments >= totalRequired) {
            overstaffed = true
        }
    }

    const { error } = await supabase.from('assignments').insert({
        shift_id: shiftId,
        volunteer_id: volunteerId,
    })

    if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
            return { error: 'This volunteer is already assigned to this shift.' }
        }
        return { error: error.message }
    }

    if (eventId) revalidatePath(`/events/${eventId}/assign`, 'page')

    if (overstaffed) {
        return { success: true, warning: 'This shift is now overstaffed. More volunteers are assigned than required.' }
    }

    return { success: true }
}

export async function unassignVolunteer(assignmentId: string) {
    const supabase = await createClient()

    const { data: assignment } = await supabase
        .from('assignments')
        .select('shift_id')
        .eq('id', assignmentId)
        .single()

    const { error } = await supabase.from('assignments').delete().eq('id', assignmentId)

    if (error) return { error: error.message }

    if (assignment?.shift_id) {
        const { data: shift } = await supabase.from('shifts').select('event_id').eq('id', assignment.shift_id).single()
        if (shift?.event_id) revalidatePath(`/events/${shift.event_id}/assign`, 'page')
    }
    return { success: true }
}

export async function clearAssignments(eventId: string) {
    const supabase = await createClient()

    // Get all shifts for this event
    const { data: shifts } = await supabase.from('shifts').select('id').eq('event_id', eventId)

    if (!shifts || shifts.length === 0) return { success: true }

    const shiftIds = shifts.map(s => s.id)

    const { error } = await supabase.from('assignments').delete().in('shift_id', shiftIds)

    if (error) return { error: error.message }

    revalidatePath(`/events/${eventId}/assign`, 'page')
    return { success: true }
}

// Helper to normalize required_groups to dictionary format
const normalizeGroups = (groups: unknown): Record<string, number> => {
    if (!groups) return {}
    if (typeof groups === 'object' && !Array.isArray(groups)) return groups as Record<string, number>

    const normalized: Record<string, number> = {}
    const items = Array.isArray(groups) ? groups : [groups.toString()]

    items.forEach((item: string) => {
        if (item.includes(':')) {
            const [group, count] = item.split(':')
            if (group && count) normalized[group.trim()] = parseInt(count) || 0
        } else {
            normalized[item.trim()] = 1
        }
    })
    return normalized
}

export async function autoAssign(eventId: string) {
    try {
        const supabase = await createClient()

        // 1. Fetch Data
        const { data: volunteers } = await supabase.from('volunteers').select('*').eq('event_id', eventId)
        const { data: shifts } = await supabase.from('shifts').select('*, assignments(*)').eq('event_id', eventId)

        if (!volunteers || !shifts) throw new Error('Failed to fetch data')

        const apiPayload = {
            volunteers: volunteers.map((v) => ({
                id: v.id,
                name: v.name,
                group: v.group,
                // API requires a number, not null. Use a high number for unlimited volunteers
                max_hours: v.max_hours ?? 999,
            })),
            unassigned_shifts: shifts.map((s) => ({
                id: s.id,
                start: new Date(s.start_time).toISOString(),
                end: new Date(s.end_time).toISOString(),
                required_groups: normalizeGroups(s.required_groups),
            })),
            current_assignments: ([] as Array<{ shift_id: string, volunteer_id: string }>).map(a => ({
                shift_id: a.shift_id,
                volunteer_id: a.volunteer_id
            }))
        }

        const apiKey = process.env.SCHEDULER_API_KEY
        const endpoint = process.env.SCHEDULER_API_URL || 'https://shift-scheduler-api-3nxm.vercel.app/api/schedule'

        if (!process.env.SCHEDULER_API_URL) {
            console.warn('Falling back to default Scheduler API endpoint. Set SCHEDULER_API_URL for custom environment.')
        }

        // 3. Call API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(apiPayload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('API Error Response:', errorText)
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        let result
        const responseText = await response.text()
        try {
            result = JSON.parse(responseText)
        } catch {
            console.error('Failed to parse API response as JSON:', responseText)
            throw new Error('API returned invalid JSON response. See console for details.')
        }

        const assignedShifts = result.assigned_shifts || {}
        const unfilledShifts = result.unfilled_shifts || []
        const fairnessScore = result.fairness_score
        const apiConflicts = result.conflicts || []

        // 4. Update Database
        // Delete existing assignments for this event
        // We need to find assignments linked to shifts of this event
        // This is a bit complex with RLS if we don't have a direct event_id on assignments,
        // but we can delete where shift_id in (select id from shifts where event_id = ...)

        // First, get all shift IDs
        const shiftIds = shifts.map(s => s.id)

        if (shiftIds.length > 0) {
            await supabase.from('assignments').delete().in('shift_id', shiftIds)
        }

        // Insert new assignments (even if partial)
        const newAssignments = []
        const partiallyFilledShifts = [] // Track shifts that got null from API

        for (const [shiftId, volunteerIds] of Object.entries(assignedShifts)) {

            // Track if this shift was partially filled (API returned null)
            if (volunteerIds === null) {
                partiallyFilledShifts.push(shiftId)
                continue
            }

            // Ensure volunteerIds is an array
            const volunteers = Array.isArray(volunteerIds) ? volunteerIds : [volunteerIds]

            for (const volunteerId of volunteers) {
                if (volunteerId) {
                    newAssignments.push({
                        shift_id: shiftId,
                        volunteer_id: volunteerId,
                    })
                }
            }
        }

        if (newAssignments.length > 0) {
            const { error } = await supabase.from('assignments').insert(newAssignments)
            if (error) throw error
        }

        revalidatePath(`/events/${eventId}/assign`, 'page')

        // Return success with unfilled shift details if any
        return {
            success: true,
            partial: (unfilledShifts.length > 0 || partiallyFilledShifts.length > 0),
            unfilled: unfilledShifts,
            partiallyFilled: partiallyFilledShifts,
            fairnessScore,
            conflicts: apiConflicts,
            message: (unfilledShifts.length > 0 || partiallyFilledShifts.length > 0)
                ? 'Partial assignment completed - some shifts could not be filled'
                : 'Auto-assignment completed successfully'
        }

    } catch (error) {
        console.error('Auto-assign error:', error)
        return { error: error instanceof Error ? error.message : String(error) }
    }
}

// Check if a volunteer's group is allowed for a shift (required_groups, allowed_groups, excluded_groups)
function volunteerFitsShift(
    volunteerGroup: string | null,
    shift: { required_groups?: unknown; allowed_groups?: string[] | null; excluded_groups?: string[] | null }
): boolean {
    const group = volunteerGroup?.trim() || ''
    const excluded = shift.excluded_groups || []
    if (excluded.length && group && excluded.some((g) => g?.trim() === group)) return false
    const allowed = shift.allowed_groups || []
    if (allowed.length && group && !allowed.some((g) => g?.trim() === group)) return false
    const required = normalizeGroups(shift.required_groups)
    const requiredKeys = Object.keys(required).filter((k) => (required[k] || 0) > 0)
    if (requiredKeys.length && group && !requiredKeys.some((k) => k.trim() === group)) return false
    return true
}

export async function swapAssignments(assignmentId1: string, assignmentId2: string) {
    const supabase = await createClient()

    const { data: a1 } = await supabase.from('assignments').select('*').eq('id', assignmentId1).single()
    const { data: a2 } = await supabase.from('assignments').select('*').eq('id', assignmentId2).single()

    if (!a1 || !a2) return { error: 'Assignments not found' }

    const { data: shift1 } = await supabase
        .from('shifts')
        .select('id, event_id, required_groups, allowed_groups, excluded_groups')
        .eq('id', a1.shift_id)
        .single()
    const { data: shift2 } = await supabase
        .from('shifts')
        .select('id, event_id, required_groups, allowed_groups, excluded_groups')
        .eq('id', a2.shift_id)
        .single()

    if (!shift1 || !shift2) return { error: 'Shifts not found' }

    const { data: vol1 } = await supabase.from('volunteers').select('group').eq('id', a1.volunteer_id).single()
    const { data: vol2 } = await supabase.from('volunteers').select('group').eq('id', a2.volunteer_id).single()

    if (!vol1 || !vol2) return { error: 'Volunteers not found' }

    const v1FitsS2 = volunteerFitsShift(vol1.group, shift2)
    const v2FitsS1 = volunteerFitsShift(vol2.group, shift1)
    if (!v1FitsS2 || !v2FitsS1) {
        return {
            error:
                'Swap would place a volunteer in a shift they are not eligible for (group requirements). ' +
                (!v1FitsS2 ? 'First volunteer does not fit the second shift.' : '') +
                (!v2FitsS1 ? ' Second volunteer does not fit the first shift.' : ''),
        }
    }

    const { error: e1 } = await supabase.from('assignments').update({ volunteer_id: a2.volunteer_id }).eq('id', assignmentId1)
    const { error: e2 } = await supabase.from('assignments').update({ volunteer_id: a1.volunteer_id }).eq('id', assignmentId2)

    if (e1 || e2) return { error: 'Failed to swap assignments' }

    const eventId = shift1.event_id || shift2.event_id
    if (eventId) revalidatePath(`/events/${eventId}/assign`, 'page')
    return { success: true }
}

export async function unfillShift(shiftId: string) {
    const supabase = await createClient()
    const { data: shift } = await supabase.from('shifts').select('event_id').eq('id', shiftId).single()
    const { error } = await supabase.from('assignments').delete().eq('shift_id', shiftId)
    if (error) return { error: error.message }
    if (shift?.event_id) revalidatePath(`/events/${shift.event_id}/assign`, 'page')
    return { success: true }
}

export async function fillShiftFromGroup(shiftId: string, groupName: string, eventId: string) {
    const supabase = await createClient()
    const { data: shift } = await supabase
        .from('shifts')
        .select('id, required_groups, assignments(id, volunteer_id)')
        .eq('id', shiftId)
        .single()
    if (!shift) return { error: 'Shift not found' }
    const required = normalizeGroups(shift.required_groups)
    const totalRequired = Object.values(required).reduce((s, c) => s + Number(c), 0)
    const current = (shift.assignments as { id: string }[] | null)?.length || 0
    const needed = Math.max(0, totalRequired - current)
    if (needed === 0) return { success: true, message: 'Shift is already full' }

    const { data: candidates } = await supabase
        .from('volunteers')
        .select('id, group')
        .eq('event_id', eventId)
        .eq('group', groupName)

    if (!candidates?.length) return { error: `No volunteers in group "${groupName}"` }

    const { data: eventShifts } = await supabase.from('shifts').select('id, start_time, end_time').eq('event_id', eventId)
    const { data: existingAssignments } = await supabase
        .from('assignments')
        .select('volunteer_id, shift_id')
        .in('shift_id', eventShifts?.map((s) => s.id) || [])

    const volToShifts = new Map<string, { start: number; end: number }[]>()
    existingAssignments?.forEach((a) => {
        const s = eventShifts?.find((x) => x.id === a.shift_id)
        if (!s) return
        const start = new Date(s.start_time).getTime()
        const end = new Date(s.end_time).getTime()
        const list = volToShifts.get(a.volunteer_id) || []
        list.push({ start, end })
        volToShifts.set(a.volunteer_id, list)
    })

    const targetShift = eventShifts?.find((s) => s.id === shiftId)
    if (!targetShift) return { error: 'Shift not found' }
    const targetStart = new Date(targetShift.start_time).getTime()
    const targetEnd = new Date(targetShift.end_time).getTime()

    const overlaps = (volId: string) => {
        const list = volToShifts.get(volId) || []
        return list.some(({ start, end }) => start < targetEnd && targetStart < end)
    }

    const alreadyOnShift = new Set((shift.assignments as { volunteer_id: string }[] | null)?.map((a) => a.volunteer_id) || [])

    let assigned = 0
    for (const vol of candidates) {
        if (assigned >= needed) break
        if (alreadyOnShift.has(vol.id) || overlaps(vol.id)) continue
        const { error: err } = await supabase.from('assignments').insert({ shift_id: shiftId, volunteer_id: vol.id })
        if (!err) {
            assigned++
            alreadyOnShift.add(vol.id)
            volToShifts.set(vol.id, [...(volToShifts.get(vol.id) || []), { start: targetStart, end: targetEnd }])
        }
    }
    revalidatePath(`/events/${eventId}/assign`, 'page')
    return { success: true, assigned, message: assigned > 0 ? `Assigned ${assigned} volunteer(s) from ${groupName}` : `No available volunteers in ${groupName} without conflicts` }
}
