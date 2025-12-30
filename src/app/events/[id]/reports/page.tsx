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
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Reporting & Analytics</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Operational intelligence and administrative exports for {event?.name || 'the event'}
                    </p>
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
