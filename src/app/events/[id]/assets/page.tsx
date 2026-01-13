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
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Assets</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Inventory and equipment tracking for {event?.name || 'the event'}
                    </p>
                </div>

                <AssetManager eventId={id} assets={assets || []} />
            </div>
        </div>
    )
}
