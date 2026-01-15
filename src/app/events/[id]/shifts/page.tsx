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

    const { data: templates } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    return (
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Shifts</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                            Operational timeline for {event?.name || 'the event'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/events/${id}/shifts/templates`}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                        >
                            Manage Templates
                        </Link>
                    </div>
                </div>

                <ShiftManager eventId={id} shifts={shifts || []} templates={templates || []} />
            </div>
        </div>
    )
}
