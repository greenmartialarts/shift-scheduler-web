import { createClient } from '@/lib/supabase/server'
import ReportsManager from './reports-manager'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ReportsPage({
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

    // Fetch all necessary data for reports
    const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .eq('event_id', id)
        .order('name')

    const { data: shifts } = await supabase
        .from('shifts')
        .select(`
            *,
            name,
            assignments (
                id,
                shift_id,
                volunteer_id,
                checked_in,
                late_dismissed,
                volunteer:volunteers (
                    id,
                    name,
                    group
                )
            )
        `)
        .eq('event_id', id)
        .order('start_time')

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link
                        href={`/events/${id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                        &larr; Back to {event?.name || 'Event'}
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Reporting & Analytics</h1>
                </div>

                <ReportsManager
                    eventId={id}
                    eventName={event?.name || 'Event'}
                    // @ts-ignore
                    volunteers={volunteers || []}
                    // @ts-ignore
                    shifts={shifts || []}
                />
            </div>
        </div>
    )
}
