import { createClient } from '@/lib/supabase/server'
import ShiftManager from './shift-manager'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ShiftsPage({
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
        .select('name')
        .eq('id', id)
        .single()

    const { data: shifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('event_id', id)
        .order('start_time', { ascending: true })

    const { data: templates } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/events/${id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                            &larr; Back to {event?.name || 'Event'}
                        </Link>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Shifts</h1>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            href={`/events/${id}/shifts/templates`}
                            className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Manage Templates
                        </Link>
                    </div>
                </div>

                <ShiftManager eventId={id} initialShifts={shifts || []} templates={templates || []} />
            </div>
        </div>
    )
}
