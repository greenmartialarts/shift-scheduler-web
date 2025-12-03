import { createClient } from '@/lib/supabase/server'
import KioskFlow from './kiosk-flow'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function KioskPage({
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

    // Fetch Event
    const { data: event } = await supabase
        .from('events')
        .select('name')
        .eq('id', id)
        .single()

    // Fetch Available Assets
    const { data: availableAssets } = await supabase
        .from('assets')
        .select('*')
        .eq('event_id', id)
        .eq('status', 'available')

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-8 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {event?.name} <span className="text-indigo-600">Kiosk</span>
                </h1>
                <Link href={`/events/${id}`} className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Exit Kiosk
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden">
                <KioskFlow
                    eventId={id}
                    availableAssets={availableAssets || []}
                />
            </main>
        </div>
    )
}
