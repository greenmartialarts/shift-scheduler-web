import { createClient } from '@/lib/supabase/server'
import GroupManager from './group-manager'
import Link from 'next/link'
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

    const { data: event } = await supabase
        .from('events')
        .select('name')
        .eq('id', id)
        .single()

    const { data: groups } = await supabase
        .from('volunteer_groups')
        .select('*, volunteers(count)')
        .eq('event_id', id)
        .order('name', { ascending: true })

    // Transform data to include volunteer count
    const groupsWithCount = groups?.map((g: any) => ({
        ...g,
        volunteer_count: g.volunteers?.[0]?.count || 0
    })) || []

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link
                        href={`/events/${id}/volunteers`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                        &larr; Back to Volunteers
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Volunteer Groups</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage groups and their colors.</p>
                </div>

                <GroupManager eventId={id} groups={groupsWithCount} />
            </div>
        </div>
    )
}
