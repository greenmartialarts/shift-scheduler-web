import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CheckinManager from './checkin-manager'

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch shifts with assignments and volunteers
    const { data: shifts, error } = await supabase
        .from('shifts')
        .select(`
            *,
            assignments (
                id,
                volunteer_id,
                checked_in,
                late_dismissed,
                volunteer:volunteers (
                    id,
                    name
                )
            )
        `)
        .eq('event_id', id)
        .order('start_time', { ascending: true })

    if (error) {
        return <div>Error loading shifts: {error.message}</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href={`/events/${id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Volunteer Check-in</h1>
                </div>
                <CheckinManager eventId={id} shifts={shifts || []} />
            </div>
        </div>
    )
}
