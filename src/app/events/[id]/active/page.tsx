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

    // Fetch all assignments for this event (for check-in/out)
    const { data: assignments } = await supabase
        .from('assignments')
        .select(`
            id,
            checked_in,
            checked_in_at,
            checked_out_at,
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
        .eq('shift.event_id', id)
        .order('shift(start_time)', { ascending: true })

    // Fetch assets
    const { data: assets } = await supabase
        .from('assets')
        .select('*, volunteer:volunteers(id, name)')
        .eq('event_id', id)
        .order('name', { ascending: true })

    // Fetch recent activity logs
    const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="p-4 md:p-8">
            <div className="mx-auto max-w-[1600px]">
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href={`/events/${id}`}
                        className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400">Live Operation</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Admin Command Center</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Real-time activity stream, personnel tracking, and asset management for {event?.name}
                    </p>
                </div>

                <ActivePersonnelManager
                    eventId={id}
                    initialAssignments={assignments || []}
                    initialAssets={assets || []}
                    initialLogs={logs || []}
                />
            </div>
        </div>
    )
}
