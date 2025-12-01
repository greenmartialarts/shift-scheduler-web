import { createClient } from '@/lib/supabase/server'
import VolunteerManager from './volunteer-manager'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function VolunteersPage({
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

    const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false })

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
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">Volunteers</h1>
                </div>

                <VolunteerManager eventId={id} initialVolunteers={volunteers || []} />
            </div>
        </div>
    )
}
