import { createClient } from '@/lib/supabase/server'
import GroupManager from './group-manager'
import { redirect } from 'next/navigation'

export default async function GroupsPage({
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

    const { data: groups } = await supabase
        .from('volunteer_groups')
        .select('*, volunteers(count)')
        .eq('event_id', id)
        .order('name', { ascending: true })

    // Transform data to include volunteer count
    const groupsWithCount = groups?.map((g) => ({
        ...g,
        volunteer_count: (g.volunteers as unknown as Array<{ count: number }>)?.[0]?.count || 0
    })) || []

    const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .eq('event_id', id)

    return (
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Volunteer Groups</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Manage personnel categorizations and visual identifiers
                    </p>
                </div>

                <GroupManager eventId={id} groups={groupsWithCount} volunteers={volunteers || []} />
            </div>
        </div>
    )
}
