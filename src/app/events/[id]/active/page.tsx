import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ActivePersonnelManager from './active-personnel-manager'

export default async function ActivePersonnelPage({
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

    // Fetch active assignments (checked_in: true, checked_out_at: null)
    // We join shifts to ensure we only get assignments for this event
    const { data: activeAssignments } = await supabase
        .from('assignments')
        .select(`
            id,
            checked_in,
            created_at,
            volunteer:volunteers!inner (
                id,
                name,
                group
            ),
            shift:shifts!inner (
                id,
                name,
                start_time,
                end_time,
                event_id
            )
        `)
        .eq('checked_in', true)
        .is('checked_out_at', null)
        .eq('shift.event_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    href={`/events/${id}`}
                    className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-indigo-600 mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400">Live Operation</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Active Personnel</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Real-time tracking of volunteers currently on-site for {event?.name}
                    </p>
                </div>

                <ActivePersonnelManager
                    eventId={id}
                    initialAssignments={activeAssignments || []}
                />
            </div>
        </div>
    )
}
