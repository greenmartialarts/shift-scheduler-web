import { EventSidebar } from '@/components/layout/EventSidebar'

export default function EventLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col md:flex-row">
            <EventSidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
