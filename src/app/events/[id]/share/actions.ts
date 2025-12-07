'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteAdmin(eventId: string, email: string) {
    const supabase = await createClient()

    // Check if user is already an admin of this event
    // The RLS policy for 'insert' on 'event_invitations' already checks if auth.uid() is an admin.
    // However, we should also check if the *target* email is already an admin to avoid redundancy.

    // First, resolve email to user_id if possible? 
    // Actually, we can't easily resolve email to user_id without a potentially sensitive query 
    // or an RPC function if strict security is on. 
    // For now, let's trust the invite flow.
    // But we can check if there's already an invite.

    // 1. Check existing invites
    const { data: existing } = await supabase
        .from('event_invitations')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', email)
        .eq('status', 'pending')
        .single()

    if (existing) {
        return { error: 'Invitation already pending for this email.' }
    }

    // 2. Create Invitation
    const { error } = await supabase.from('event_invitations').insert({
        event_id: eventId,
        email: email,
    })

    if (error) {
        console.error('Error inviting admin:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/share`)
    return { success: true }
}

export async function revokeInvitation(invitationId: string, eventId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('event_invitations')
        .delete()
        .eq('id', invitationId)

    if (error) {
        console.error('Error revoking invitation:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/share`)
    return { success: true }
}

export async function removeAdmin(eventId: string, userId: string) {
    const supabase = await createClient()

    // Prevent removing self if it's the last admin?
    // Implementation: Count admins. If 1 and userId == auth.uid(), deny.

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (userId === user.id) {
        const { count } = await supabase
            .from('event_admins')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)

        if (count !== null && count <= 1) {
            return { error: 'Cannot remove the last admin.' }
        }
    }

    const { error } = await supabase
        .from('event_admins')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error removing admin:', error)
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}/share`)

    // If I removed myself, redirect to events list? 
    // The UI handles the action result, so we just return success here.
    return { success: true }
}

export async function getEventAdmins(eventId: string) {
    const supabase = await createClient()

    // Use secure RPC function to get admins with emails
    const { data, error } = await supabase.rpc('get_event_admins_details', {
        lookup_event_id: eventId
    })

    if (error) {
        console.error('Error fetching event admins:', error)
        return { error: error.message }
    }
    return { data }
}

export async function getPendingInvitations(eventId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending')

    if (error) return { error: error.message }
    return { data }
}
