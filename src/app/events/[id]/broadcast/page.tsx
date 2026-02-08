import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BroadcastManager from './broadcast-manager'

export default async function BroadcastPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: eventId } = await params
    const supabase = await createClient()

    // Fetch event details
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    if (!event) notFound()

    // Fetch volunteers for this event
    const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .eq('event_id', eventId)
        .order('name')

    // Fetch active (checked-in) personnel
    const { data: activePersonnel } = await supabase
        .from('attendance')
        .select('volunteer_id')
        .eq('event_id', eventId)
        .is('check_out', null)

    const activeIds = new Set(activePersonnel?.map(p => p.volunteer_id) || [])

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter mb-4">
                    Broadcast <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Hub</span>
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold max-w-2xl italic">
                    Command center for real-time coordination. Deploy messages across your roster with strategic multi-account rotation.
                </p>
            </div>

            <BroadcastManager
                eventId={eventId}
                volunteers={volunteers || []}
                activeVolunteerIds={activeIds as Set<string>}
            />
        </div>
    )
}
