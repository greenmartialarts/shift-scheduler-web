import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuditLogManager from './audit-log-manager'

export default async function AuditLogPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: eventId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: event } = await supabase
        .from('events')
        .select('name')
        .eq('id', eventId)
        .single()

    if (!event) redirect('/events')

    const { data: logs } = await supabase
        .from('activity_logs')
        .select(`
            id,
            type,
            description,
            volunteer_id,
            metadata,
            created_at,
            volunteers(id, name)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(500)

    return (
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Audit Log</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Who did what for {event.name} – compliance and debugging
                    </p>
                </div>
                <AuditLogManager eventName={event.name} logs={logs || []} />
            </div>
        </div>
    )
}
