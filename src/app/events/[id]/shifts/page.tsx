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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link
                        href={`/events/${id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        &larr; Back to {event?.name || 'Event'}
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">Shifts</h1>
                </div>

                <ShiftManager eventId={id} initialShifts={shifts || []} />
            </div>
        </div>
    )
}
