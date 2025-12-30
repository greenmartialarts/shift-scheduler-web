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
            name,
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
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Volunteer Check-in</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Real-time attendance tracking and personnel management
                    </p>
                </div>
                <CheckinManager eventId={id} shifts={shifts || []} />
            </div>
        </div>
    )
}
