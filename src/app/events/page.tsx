import { createClient } from '@/lib/supabase/server'
import { createEvent, deleteEvent, getUserInvitations, acceptInvitation, declineInvitation } from './actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EventsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

    const invitations = await getUserInvitations()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
                    <form action="/auth/signout" method="post">
                        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                            Sign out
                        </button>
                    </form>
                </div>

                {/* Invitations Section */}
                {invitations.length > 0 && (
                    <div className="mb-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-6 border border-indigo-100 dark:border-indigo-800">
                        <h2 className="mb-4 text-lg font-medium text-indigo-900 dark:text-indigo-300">
                            Pending Invitations ({invitations.length})
                        </h2>
                        <div className="grid gap-4">
                            {invitations.map((invite: any) => (
                                <div key={invite.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Invitation to manage <span className="text-indigo-600 dark:text-indigo-400">
                                                {invite.events?.name || 'Unknown Event'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={async () => {
                                            'use server'
                                            await acceptInvitation(invite.id)
                                        }}>
                                            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                                                Accept
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await declineInvitation(invite.id)
                                        }}>
                                            <button type="submit" className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                Decline
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-colors duration-200">
                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Create New Event</h2>
                    <form action={createEvent} className="flex gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Event Name"
                            required
                            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Create
                        </button>
                    </form>
                </div>

                <div className="grid gap-4">
                    {events?.map((event) => {
                        const isOwner = event.user_id === user.id
                        return (
                            <div
                                key={event.id}
                                className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md transition-colors duration-200"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                        >
                                            {event.name}
                                        </Link>
                                        {!isOwner && (
                                            <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{new Date(event.created_at).toLocaleDateString()}</span>
                                        <Link href={`/events/${event.id}/share`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                            Manage Access
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isOwner ? (
                                        <form action={deleteEvent}>
                                            <input type="hidden" name="id" value={event.id} />
                                            <button
                                                type="submit"
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Shared with you</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {events?.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400">No events found. Create one to get started.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

