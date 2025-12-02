import { createClient } from '@/lib/supabase/server'
import { createEvent, deleteEvent } from './actions'
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
                    {events?.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md transition-colors duration-200"
                        >
                            <Link
                                href={`/events/${event.id}`}
                                className="flex-1 text-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                            >
                                {event.name}
                            </Link>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(event.created_at).toLocaleDateString()}
                                </span>
                                <form action={deleteEvent}>
                                    <input type="hidden" name="id" value={event.id} />
                                    <button
                                        type="submit"
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {events?.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400">No events found. Create one to get started.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
