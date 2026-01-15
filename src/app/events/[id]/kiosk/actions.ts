'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logActivity } from '../active/actions'

export async function searchVolunteers(eventId: string, query: string) {
    const supabase = await createClient()

    if (!query || query.trim().length === 0) {
        return { volunteers: [] }
    }

    const { data: volunteers, error } = await supabase
        .from('volunteers')
        .select(`
            id,
            name,
            group,
            assignments(
                id,
                checked_in,
                checked_out_at,
                required_groups,
                shift: shifts(
                    id,
                    start_time,
                    end_time,
                    name
                )
            ),
            active_assets: asset_assignments(
                id,
                checked_in_at,
                asset: assets(
                    id,
                    name,
                    identifier
                )
            )
        `)
        .eq('event_id', eventId)
        .ilike('name', `%${query}%`)
        .limit(20)

    if (error) {
        console.error('Error searching volunteers:', error)
        return { volunteers: [] }
    }

    const processedVolunteers = volunteers.map((v) => {
        const rv = v as Record<string, unknown>
        const assignments = (rv.assignments as Array<Record<string, unknown>> || []).map(a => ({
            ...a,
            shift: Array.isArray(a.shift) ? a.shift[0] : a.shift
        }))
        const active_assets = (rv.active_assets as Array<Record<string, unknown>> || [])
            .filter(aa => aa.checked_in_at === null)
        return {
            ...v,
            assignments,
            active_assets
        }
    })

    return { volunteers: processedVolunteers }
}

export async function kioskCheckIn(
    eventId: string,
    volunteerId: string,
    assignmentId: string,
    assetIds: string[],
    previousAssignmentId?: string,
    transferAssets: boolean = false
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // 1. Handle Previous Assignment Checkout
    if (previousAssignmentId) {
        const { error: checkoutError } = await supabase
            .from('assignments')
            .update({ checked_out_at: new Date().toISOString() })
            .eq('id', previousAssignmentId)

        if (checkoutError) {
            return { error: 'Failed to check out of previous shift: ' + checkoutError.message }
        }

        // If NOT transferring assets, we need to return them
        if (!transferAssets) {
            // Find assets assigned to this volunteer that are currently active
            const { data: activeAssets } = await supabase
                .from('asset_assignments')
                .select('asset_id, asset:assets(name)')
                .eq('volunteer_id', volunteerId)
                .is('checked_in_at', null)

            if (activeAssets && activeAssets.length > 0) {
                const assetIdsToReturn = activeAssets.map(a => a.asset_id)
                const assetNames = activeAssets.map(a => (a.asset as { name?: string } | null)?.name || 'Unknown Asset').join(', ')

                // Return assets
                await supabase
                    .from('asset_assignments')
                    .update({ checked_in_at: new Date().toISOString() })
                    .in('asset_id', assetIdsToReturn)
                    .eq('volunteer_id', volunteerId)
                    .is('checked_in_at', null)

                await supabase
                    .from('assets')
                    .update({ status: 'available', volunteer_id: null })
                    .in('id', assetIdsToReturn)

                await logActivity(eventId, 'asset_in', `Assets returned during checkout: ${assetNames}`, volunteerId)
            }
        }
    }

    // 2. Check In to New Assignment
    if (assignmentId && assignmentId !== 'no-assignment') {
        const { error: checkInError } = await supabase
            .from('assignments')
            .update({
                checked_in: true,
                checked_in_at: new Date().toISOString(),
                checked_out_at: null // Reset checkout if re-checking in
            })
            .eq('id', assignmentId)

        if (checkInError) {
            return { error: 'Failed to check in: ' + checkInError.message }
        }

        // Get volunteer name for log
        const { data: volunteer } = await supabase.from('volunteers').select('name').eq('id', volunteerId).single()
        await logActivity(eventId, 'check_in', `${volunteer?.name || 'Volunteer'} checked in via Kiosk.`, volunteerId, { assignmentId })
    }

    // 3. Assign NEW assets (if any selected)
    if (assetIds.length > 0) {
        const assignments = assetIds.map(assetId => ({
            asset_id: assetId,
            volunteer_id: volunteerId,
            checked_out_at: new Date().toISOString(),
        }))

        const { error: assignError } = await supabase
            .from('asset_assignments')
            .insert(assignments)

        if (assignError) {
            console.error('Error assigning assets:', assignError)
            return { error: 'Checked in, but failed to assign assets.' }
        }

        await supabase
            .from('assets')
            .update({ status: 'assigned', volunteer_id: volunteerId })
            .in('id', assetIds)

        // Log asset assignment
        const { data: assets } = await supabase.from('assets').select('name').in('id', assetIds)
        const assetNames = assets?.map(a => a.name).join(', ')
        const { data: volunteer } = await supabase.from('volunteers').select('name').eq('id', volunteerId).single()
        await logActivity(eventId, 'asset_out', `Assets checked out to ${volunteer?.name || 'Volunteer'}: ${assetNames}`, volunteerId)
    }

    revalidatePath(`/events/${eventId}/kiosk`, 'page')
    return { success: true }
}

export async function kioskCheckOut(
    eventId: string,
    volunteerId: string,
    assignmentId: string,
    assetIdsToReturn: string[]
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // 1. Mark assignment as checked out
    if (assignmentId && assignmentId !== 'any') {
        const { error: checkoutError } = await supabase
            .from('assignments')
            .update({
                checked_out_at: new Date().toISOString(),
                checked_in: false
            })
            .eq('id', assignmentId)

        if (checkoutError) {
            return { error: 'Failed to check out: ' + checkoutError.message }
        }

        // Get volunteer name for log
        const { data: volunteer } = await supabase.from('volunteers').select('name').eq('id', volunteerId).single()
        await logActivity(eventId, 'check_out', `${volunteer?.name || 'Volunteer'} checked out via Kiosk.`, volunteerId, { assignmentId })
    }

    // 2. Return Assets
    if (assetIdsToReturn.length > 0) {
        const { error: returnError } = await supabase
            .from('asset_assignments')
            .update({ checked_in_at: new Date().toISOString() })
            .in('asset_id', assetIdsToReturn)
            .eq('volunteer_id', volunteerId)
            .is('checked_in_at', null)

        if (returnError) {
            return { error: 'Failed to return assets: ' + returnError.message }
        }

        const { error: statusError } = await supabase
            .from('assets')
            .update({ status: 'available', volunteer_id: null })
            .in('id', assetIdsToReturn)

        if (statusError) {
            console.error('Error updating asset status:', statusError)
        }

        // Log asset return
        const { data: assets } = await supabase.from('assets').select('name').in('id', assetIdsToReturn)
        const assetNames = assets?.map(a => a.name).join(', ')
        // Get volunteer name for log
        await supabase.from('volunteers').select('name').eq('id', volunteerId).single()
        await logActivity(eventId, 'asset_in', `Assets returned via Kiosk: ${assetNames}`, volunteerId)
    }

    revalidatePath(`/events/${eventId}/kiosk`, 'page')
    revalidatePath(`/events/${eventId}/active`, 'page')
    return { success: true }
}
