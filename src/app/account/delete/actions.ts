'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteAccount() {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Not authenticated' }
    }

    try {
        // Delete all events (cascade will delete volunteers, shifts, assignments, etc.)
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Error deleting user data:', deleteError)
            return { error: 'Failed to delete account data' }
        }

        // Sign out and delete auth user
        await supabase.auth.signOut()

        // Note: To fully delete the auth user, you need to enable the Supabase Auth Admin API
        // or create a database function with service role permissions
        // For now, we'll just delete all data and sign them out

        revalidatePath('/', 'layout')
        redirect('/login')
    } catch (error: unknown) {
        console.error('Account deletion error:', error)
        return { error: error instanceof Error ? error.message : 'Failed to delete account' }
    }
}
