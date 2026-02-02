'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const timezone = formData.get('timezone') as string || 'UTC'

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Create Event
    const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
            name,
            user_id: user.id,
            date: new Date().toISOString(), // Default to today for now
            timezone,
        })
        .select()
        .single()

    if (eventError) {
        console.error('Error creating event:', eventError)
        return // Handle error
    }

    // 2. Add creator as Admin
    const { error: adminError } = await supabase
        .from('event_admins')
        .insert({
            event_id: event.id,
            user_id: user.id,
            role: 'admin',
        })

    if (adminError) {
        console.error('Error adding admin:', adminError)
        // Cleanup event if admin creation fails? Or just log.
        // If this fails, the user created an event they can't see.
    }

    revalidatePath('/events')
    return { id: event.id }
}

export async function updateEventSettings(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const timezone = formData.get('timezone') as string
    const recurrence_rule = (formData.get('recurrence_rule') as string) || null

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Check if user is admin of this event
    const { data: adminCheck } = await supabase
        .from('event_admins')
        .select('role')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single()

    if (!adminCheck) return { error: 'Not authorized' }

    const { error } = await supabase
        .from('events')
        .update({ name, timezone, recurrence_rule })
        .eq('id', id)

    if (error) {
        console.error('Error updating event:', error)
        return { error: 'Failed to update settings' }
    }

    revalidatePath(`/events/${id}`)
    revalidatePath(`/events/${id}/share`)
    return { success: true }
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

export async function getUserInvitations() {
    const supabase = await createClient()

    // Fetch invites using the secure function that includes event name
    const { data, error } = await supabase.rpc('get_my_pending_invitations')

    if (error) {
        console.error('Error fetching invitations:', error)
        return []
    }

    // Map to expected format for frontend (shim to match previous structure if needed, or just return)
    return (data as Array<Record<string, unknown>>)?.map((invite) => ({
        ...invite,
        events: { name: invite.event_name }
    })) || []
}

export async function acceptInvitation(invitationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Use secure RPC function to accept the invitation
    const { error } = await supabase.rpc('accept_event_invitation', {
        invitation_id: invitationId
    })

    if (error) {
        console.error('Error accepting invitation:', error)
        return { error: error.message }
    }

    revalidatePath('/events')
    return { success: true }
}

export async function declineInvitation(invitationId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('event_invitations')
        .update({ status: 'declined' }) // Or delete()
        .eq('id', invitationId)

    if (error) return { error: error.message }

    revalidatePath('/events')
    return { success: true }
}
