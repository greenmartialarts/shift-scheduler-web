import { createClient } from '@/lib/supabase/server'
import AssetManager from './asset-manager'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AssetsPage({
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

    const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .eq('event_id', id)
        .order('type', { ascending: true })
        .order('name', { ascending: true })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link
                        href={`/events/${id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                        &larr; Back to {event?.name || 'Event'}
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Asset Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track radios, vests, and other equipment.</p>
                </div>

                <AssetManager eventId={id} assets={assets || []} />
            </div>
        </div>
    )
}
