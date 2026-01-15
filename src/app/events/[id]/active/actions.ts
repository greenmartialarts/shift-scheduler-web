'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkInVolunteer(assignmentId: string, eventId: string, volunteerName: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // 1. Update assignment
    const { error } = await supabase
        .from('assignments')
        .update({
            checked_in_at: now,
            checked_out_at: null,
            checked_in: true
        })
        .eq('id', assignmentId)

    if (error) return { error: error.message }

    // 2. Log activity
    await logActivity(eventId, 'check_in', `${volunteerName} checked in.`, undefined, { assignmentId })

    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}

export async function checkOutVolunteer(assignmentId: string, eventId: string, volunteerName: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // 1. Update assignment
    const { error } = await supabase
        .from('assignments')
        .update({
            checked_out_at: now,
            checked_in: false
        })
        .eq('id', assignmentId)

    if (error) return { error: error.message }

    // 2. Log activity
    await logActivity(eventId, 'check_out', `${volunteerName} checked out.`, undefined, { assignmentId })

    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}

export async function assignAsset(assetId: string, volunteerId: string, eventId: string, assetName: string, volunteerName: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // 1. Update asset
    const { error: assetError } = await supabase
        .from('assets')
        .update({
            status: 'assigned',
            volunteer_id: volunteerId
        })
        .eq('id', assetId)

    if (assetError) return { error: assetError.message }

    // 2. Insert into asset_assignments
    const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .insert({
            asset_id: assetId,
            volunteer_id: volunteerId,
            checked_out_at: now
        })

    if (assignmentError) return { error: assignmentError.message }

    // 3. Log activity
    await logActivity(eventId, 'asset_out', `${assetName} checked out to ${volunteerName}.`, volunteerId, { assetId })

    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}

export async function returnAsset(assetId: string, eventId: string, assetName: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // 1. Get current holder for log
    const { data: assetData } = await supabase
        .from('assets')
        .select('volunteer_id, volunteers(name)')
        .eq('id', assetId)
        .single()

    let volunteerName = 'Unknown'
    if (assetData?.volunteers) {
        if (Array.isArray(assetData.volunteers)) {
            volunteerName = assetData.volunteers[0]?.name || 'Unknown'
        } else {
            // @ts-expect-error: volunteers might be a single object or array depending on join result structure
            volunteerName = assetData.volunteers.name || 'Unknown'
        }
    }

    // 2. Update asset_assignments (set checked_in_at for the active record)
    const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .update({ checked_in_at: now })
        .eq('asset_id', assetId)
        .eq('volunteer_id', assetData?.volunteer_id)
        .is('checked_in_at', null)

    if (assignmentError) return { error: assignmentError.message }

    // 3. Update asset
    const { error: assetError } = await supabase
        .from('assets')
        .update({
            status: 'available',
            volunteer_id: null
        })
        .eq('id', assetId)

    if (assetError) return { error: assetError.message }

    // 4. Log activity
    await logActivity(eventId, 'asset_in', `${assetName} returned by ${volunteerName}.`, undefined, { assetId })

    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}

export async function logActivity(eventId: string, type: string, description: string, volunteerId?: string, metadata: any = {}) {
    const supabase = await createClient()
    await supabase.from('activity_logs').insert({
        event_id: eventId,
        type,
        description,
        volunteer_id: volunteerId || null,
        metadata
    })

    revalidatePath(`/events/${eventId}/active`, 'page')
}

export async function createAsset(eventId: string, name: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('assets').insert({
        event_id: eventId,
        name,
        status: 'available'
    })

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}

export async function deleteAsset(assetId: string, eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('assets').delete().eq('id', assetId)

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}
