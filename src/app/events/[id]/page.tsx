import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export default async function EventDashboard({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (!event) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        &larr; Back to Events
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{event.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Link
                        href={`/events/${id}/volunteers`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Volunteers
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage volunteers, add individually or bulk upload via CSV.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/shifts`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Shifts
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage shifts, set requirements, and bulk upload.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/assign`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Assignments
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Assign volunteers to shifts manually or use Auto-Assign.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/checkin`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Check-in
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Track volunteer attendance and manage late arrivals.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
