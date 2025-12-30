import { createClient } from '@/lib/supabase/server'
import AssignmentManager from './assignment-manager'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AssignPage({
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

    // Fetch shifts with assignments and volunteers
    const { data: shifts } = await supabase
        .from('shifts')
        .select(`
      *,
      name,
      assignments (
        id,
        shift_id,
        volunteer_id,
        volunteer:volunteers (
          id,
          name,
          group
        )
      )
    `)
        .eq('event_id', id)
        .order('start_time', { ascending: true })

    const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .eq('event_id', id)
        .order('name', { ascending: true })

    return (
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Assignments</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Coordinate personnel and optimize shift coverage
                    </p>
                </div>

                <AssignmentManager
                    eventId={id}
                    // @ts-ignore
                    shifts={shifts || []}
                    volunteers={volunteers || []}
                />
            </div>
        </div>
    )
}
