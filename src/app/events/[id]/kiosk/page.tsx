import { createClient } from '@/lib/supabase/server'
import KioskFlow from './kiosk-flow'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BackgroundSphere } from '@/components/ui/BackgroundSphere'

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
        <div className="relative min-h-screen overflow-hidden flex flex-col">
            <BackgroundSphere />

            {/* Floating Glass Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-5xl z-50">
                <div className="glass-panel px-8 py-4 rounded-3xl flex justify-between items-center shadow-2xl backdrop-blur-2xl">
                    <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">
                        {event?.name} <span className="text-blue-600">Kiosk</span>
                    </h1>
                    <Link
                        href={`/events/${id}`}
                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                        Exit Kiosk
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col pt-32 pb-12 px-6 relative z-10">
                <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
                    <KioskFlow
                        eventId={id}
                        availableAssets={availableAssets || []}
                    />
                </div>
            </main>
        </div>
    )
}
