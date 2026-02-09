import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, Calendar, AlertTriangle, PieChart as PieChartIcon, Zap } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { CloneEventModal } from '@/components/dashboard/CloneEventModal'
import { getDashboardStats } from '@/lib/dashboard-actions'

interface Event {
    id: string
    name: string
    date: string
}

export default async function EventDashboard({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (!eventData) {
        redirect('/events')
    }

    const stats = await getDashboardStats(id)
    const event = eventData as Event

    return (
        <main className="p-6 md:p-12">
            <div className="mx-auto max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            {event.name}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                            Event coordination control center
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/events/${id}/kiosk`}
                            className="button-premium text-nowrap"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Launch Kiosk
                        </Link>
                        <CloneEventModal
                            eventId={id}
                            eventName={event.name}
                        />
                    </div>
                </header>

                {/* Quick Stats Grid */}
                <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Fill Rate', value: `${Math.round(stats.fillRate)}%`, sub: `${stats.filledSlotsCount} / ${stats.totalSlots}`, color: stats.fillRate >= 80 ? 'text-green-500' : stats.fillRate >= 50 ? 'text-yellow-500' : 'text-red-500' },
                        { label: 'Volunteers', value: stats.totalVolunteersCount, sub: 'Registered members' },
                        { label: 'Hours Tracked', value: Math.round(stats.totalHours), sub: 'Projected demand' },
                        { label: 'Active Personnel', value: stats.activeCurrentlyCount, sub: 'Currently on-site', color: 'text-green-500', href: `/events/${id}/active` },
                    ].map((stat) => (
                        stat.href ? (
                            <Link key={stat.label} href={stat.href} className="premium-card p-6 block hover:border-blue-500/30 transition-all">
                                <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
                                <p className={`text-4xl font-black tracking-tighter ${stat.color || 'text-zinc-900 dark:text-zinc-50'}`}>{stat.value}</p>
                                <p className="text-xs font-bold text-zinc-500 mt-1">{stat.sub}</p>
                            </Link>
                        ) : (
                            <div key={stat.label} className="premium-card p-6">
                                <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
                                <p className={`text-4xl font-black tracking-tighter ${stat.color || 'text-zinc-900 dark:text-zinc-50'}`}>{stat.value}</p>
                                <p className="text-xs font-bold text-zinc-500 mt-1">{stat.sub}</p>
                            </div>
                        )
                    ))}
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard label="Total Shifts" value={stats.totalShiftsCount} icon={Calendar} className="premium-card" />
                    <StatCard label="Total Slots" value={stats.totalSlots} icon={Users} className="premium-card" />
                    <StatCard label="Late Arrivals" value={stats.lateCount} icon={AlertTriangle} className={`premium-card ${stats.lateCount > 0 ? 'border-red-500/30' : ''}`} />
                </div>

                {/* Charts & Analytics */}
                <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/30 mb-12">
                    <div className="flex items-center gap-2 mb-8">
                        <PieChartIcon className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Operational Intelligence</h2>
                    </div>
                    <AnalyticsCharts
                        volunteersByGroup={stats.volunteersByGroupData}
                        shiftFillStatus={stats.shiftFillStatusData}
                    />
                </div>

                {/* Core Management Modules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { id: 'admin-panel-link', name: 'Admin Center', desc: 'Real-time activity stream and asset tracking.', href: `/events/${id}/active`, highlight: true },
                        { id: 'tab-volunteers', name: 'Volunteers', desc: 'Manage profiles, groups, and bulk CSV imports.', href: `/events/${id}/volunteers` },
                        { id: 'tab-shifts', name: 'Shifts', desc: 'Configure shift timelines and group requirements.', href: `/events/${id}/shifts` },
                        { id: 'tab-assets', name: 'Assets', desc: 'Track radios, vests, and other event equipment.', href: `/events/${id}/assets` },
                        { id: 'tab-assignments', name: 'Assignments', desc: 'Auto-optimize or manually curate the roster.', href: `/events/${id}/assign` },
                        { name: 'Broadcast', desc: 'Securely message volunteers with multi-account rotation.', href: `/events/${id}/broadcast` },
                        { name: 'Attendance', desc: 'Real-time check-in/out and arrival tracking.', href: `/events/${id}/checkin` },
                        { name: 'Reports', desc: 'Export analytics, sign-in docs, and hours.', href: `/events/${id}/reports` },
                        { id: 'tab-share', name: 'Settings', desc: 'Sharing controls and event configurations.', href: `/events/${id}/share` },
                    ].map((module) => (
                        <Link
                            key={module.name}
                            id={module.id}
                            href={module.href}
                            className={`premium-card p-8 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${module.highlight ? 'ring-2 ring-blue-500 shadow-blue-500/20' : ''}`}
                        >
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-3">
                                {module.name}
                            </h3>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                                {module.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
