'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignVolunteer(shiftId: string, volunteerId: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('assignments').insert({
        shift_id: shiftId,
        volunteer_id: volunteerId,
    })

    if (error) {
        console.error('Error assigning volunteer:', error)
        return { error: error.message }
    }

    revalidatePath('/events/[id]/assign', 'page') // We'll need to pass eventId to be precise, but this works if we are on the page
    return { success: true }
}

export async function unassignVolunteer(assignmentId: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('assignments').delete().eq('id', assignmentId)

    if (error) {
        console.error('Error unassigning volunteer:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function autoAssign(eventId: string, strategy: string = 'minimize_unfilled') {
    const supabase = await createClient()

    // 1. Fetch all data
    const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .eq('event_id', eventId)

    const { data: shifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('event_id', eventId)

    if (!volunteers || !shifts) {
        return { error: 'No data found' }
    }

    // 2. Transform to API format
    const apiPayload = {
        volunteers: volunteers.map((v) => ({
            id: v.id,
            name: v.name,
            group: v.group,
            // API requires a number, not null. Use a high number for unlimited volunteers
            max_hours: v.max_hours ?? 999,
        })),
        shifts: shifts.map((s) => ({
            id: s.id,
            start: new Date(s.start_time).toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
            end: new Date(s.end_time).toISOString().slice(0, 16),
            required_groups: s.required_groups,
            allowed_groups: s.allowed_groups,
            excluded_groups: s.excluded_groups,
        })),
        strategy: strategy,
    }

    // Debug logging
    console.log('=== AUTO-ASSIGN DEBUG ===')
    console.log('Volunteers:', volunteers.length)
    console.log('Shifts:', shifts.length)
    console.log('Sample volunteer:', volunteers[0])
    console.log('Sample shift:', shifts[0])
    console.log('API Payload:', JSON.stringify(apiPayload, null, 2))

    // 3. Call API
    try {
        const response = await fetch('https://shift-scheduler-api-j4wh.onrender.com/schedule/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
        })

        let result
        let assignedShifts
        let unfilledShifts = []

        if (response.status === 422) {
            // Scheduling was impossible/incomplete - API returns detailed error info
            const errorData = await response.json()
            console.log('=== 422 ERROR RESPONSE ===')
            console.log('Full error data:', JSON.stringify(errorData, null, 2))

            const detail = errorData.detail

            // Extract partial assignments and unfilled shift info
            assignedShifts = detail.assigned_shifts || {}
            unfilledShifts = detail.unfilled_shifts || []

            console.log('Partial scheduling result:', { assignedShifts, unfilledShifts })
        } else if (!response.ok) {
            // Other API errors
            const text = await response.text()
            throw new Error(`API Error: ${text}`)
        } else {
            // Success - all shifts filled
            result = await response.json()
            assignedShifts = result.assigned_shifts
            unfilledShifts = result.unfilled_shifts || []

            console.log('=== API RESPONSE ===')
            console.log('Status:', response.status)
            console.log('Result:', result)
            console.log('Assigned shifts count:', Object.keys(assignedShifts).length)
        }

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
        for (const [shiftId, volunteerIds] of Object.entries(assignedShifts)) {
            // @ts-ignore
            for (const volunteerId of volunteerIds) {
                newAssignments.push({
                    shift_id: shiftId,
                    volunteer_id: volunteerId,
                })
            }
        }

        if (newAssignments.length > 0) {
            const { error } = await supabase.from('assignments').insert(newAssignments)
            if (error) throw error
        }

        revalidatePath(`/events/${eventId}/assign`)

        // Return success with unfilled shift details if any
        if (unfilledShifts.length > 0) {
            return {
                success: true,
                partial: true,
                unfilled: unfilledShifts,
                message: 'Partial assignment completed - some shifts could not be filled'
            }
        }

        return { success: true, unfilled: [] }

    } catch (error: any) {
        console.error('Auto-assign error:', error)
        return { error: error.message }
    }
}

export async function swapAssignments(assignmentId1: string, assignmentId2: string) {
    const supabase = await createClient()

    // Fetch both assignments
    const { data: a1 } = await supabase.from('assignments').select('*').eq('id', assignmentId1).single()
    const { data: a2 } = await supabase.from('assignments').select('*').eq('id', assignmentId2).single()

    if (!a1 || !a2) return { error: 'Assignment not found' }

    // Swap volunteer_ids
    const { error: e1 } = await supabase.from('assignments').update({ volunteer_id: a2.volunteer_id }).eq('id', assignmentId1)
    const { error: e2 } = await supabase.from('assignments').update({ volunteer_id: a1.volunteer_id }).eq('id', assignmentId2)

    if (e1 || e2) return { error: 'Error swapping' }

    return { success: true }
}
