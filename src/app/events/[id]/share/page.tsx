import { createClient } from '@/lib/supabase/server'
import { inviteAdmin, removeAdmin, revokeInvitation, getEventAdmins, getPendingInvitations } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check access & fetch event details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    if (eventError || !event) {
        // If RLS works, this might return null/error if not admin.
        redirect('/events')
    }

    const { data: admins } = await getEventAdmins(eventId)
    const { data: pending } = await getPendingInvitations(eventId)

    // Helper to check if current user is the "Owner" (creator)
    // The creator is just another admin now, but historically user_id on event.
    // We might want to prevent removing the creator? Or just let it happen?
    // The 'removeAdmin' action prevents removing the *last* admin.

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href={`/events/${eventId}`} className="text-indigo-600 dark:text-indigo-400 hover:underline mb-2 block">
                        &larr; Back to Event
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Share & Manage Access
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {event.name}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Invite Section */}
                    <div className="space-y-6">
                        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-colors duration-200">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Invite Admin
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Invite another user to manage this event. They will have full access.
                            </p>
                            <form action={async (formData) => {
                                'use server'
                                const email = formData.get('email') as string
                                await inviteAdmin(eventId, email)
                            }}>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="user@example.com"
                                        required
                                        className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Invite
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Pending Invitations */}
                        {pending && pending.length > 0 && (
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-colors duration-200">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Pending Invitations
                                </h2>
                                <div className="space-y-4">
                                    {pending.map((invite: any) => (
                                        <div key={invite.id} className="flex items-center justify-between border-b dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{invite.email}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                                            </div>
                                            <form action={async () => {
                                                'use server'
                                                await revokeInvitation(invite.id, eventId)
                                            }}>
                                                <button type="submit" className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                    Revoke
                                                </button>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Admins List */}
                    <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-colors duration-200 h-fit">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Current Admins
                        </h2>
                        <div className="space-y-4">
                            {admins?.map((admin: any) => {
                                const isMe = admin.user_id === user.id
                                return (
                                    <div key={admin.user_id} className="flex items-center justify-between border-b dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                                                {/* Initials placeholder since we don't have name/email easily */}
                                                {admin.email ? admin.email[0].toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {isMe ? 'You' : (admin.email || `User ${admin.user_id.slice(0, 8)}...`)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {admin.email ? `Role: ${admin.role}` : `Joined: ${new Date(admin.created_at).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>

                                        <form action={async () => {
                                            'use server'
                                            await removeAdmin(eventId, admin.user_id)
                                        }}>
                                            <button
                                                type="submit"
                                                className={`text-sm ${isMe ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'}`}
                                                disabled={isMe} // Don't allow removing self from here easily? Logic supports it but safer to disable or require confirmation.
                                            // Actually the backend action checks for "last admin", so removing self is OK if there are others. 
                                            // The button says "Remove", if it's me maybe "Leave"?
                                            >
                                                {isMe ? 'Leave' : 'Remove'}
                                            </button>
                                        </form>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
