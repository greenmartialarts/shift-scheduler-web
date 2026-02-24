import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, Calendar, AlertTriangle, PieChart as PieChartIcon, Zap, FileBarChart, ChevronRight, GraduationCap } from 'lucide-react'
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
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Link href="/events" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">
                                Events
                            </Link>
                            <span className="text-zinc-300 dark:text-zinc-700">/</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Command Center</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            {event.name}
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-3 font-semibold text-lg italic">
                            Real-time coordination and staffing oversight.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href={`/events/${id}/kiosk`}
                            className="button-premium text-nowrap px-8 py-3.5 flex items-center gap-2 shadow-xl shadow-blue-500/10"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            Launch Kiosk
                        </Link>
                        <CloneEventModal
                            eventId={id}
                            eventName={event.name}
                        />
                    </div>
                </header>

                {/* Quick Stats Grid */}
                <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Fill Rate', value: `${Math.round(stats.fillRate)}%`, sub: `${stats.filledSlotsCount} / ${stats.totalSlots}`, color: stats.fillRate >= 80 ? 'text-green-500' : stats.fillRate >= 50 ? 'text-yellow-500' : 'text-red-500' },
                        { label: 'Volunteers', value: stats.totalVolunteersCount, sub: 'Registered members' },
                        { label: 'Hours Tracked', value: Math.round(stats.totalHours), sub: 'Projected demand' },
                        { label: 'Active Personnel', value: stats.activeCurrentlyCount, sub: 'Currently on-site', color: 'text-green-500', href: `/events/${id}/active`, pulse: true },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`premium-card p-6 relative group transition-all duration-300 ${stat.href ? 'hover:border-blue-500/40 cursor-pointer' : ''}`}
                            style={{
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                background: 'transparent'
                            }}
                        >
                            {stat.href ? (
                                <Link href={stat.href} className="absolute inset-0 z-10" />
                            ) : null}
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">{stat.label}</p>
                                {stat.pulse && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                            <p className={`text-4xl font-black tracking-tighter ${stat.color || 'text-zinc-900 dark:text-zinc-50'}`}>{stat.value}</p>
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-2">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard label="Total Shifts" value={stats.totalShiftsCount} icon={Calendar} className="premium-card !bg-transparent border border-zinc-200 dark:border-zinc-800" />
                    <StatCard label="Total Slots" value={stats.totalSlots} icon={Users} className="premium-card !bg-transparent border border-zinc-200 dark:border-zinc-800" />
                    <StatCard label="Late Arrivals" value={stats.lateCount} icon={AlertTriangle} className={`premium-card !bg-transparent border ${stats.lateCount > 0 ? 'border-red-500/30' : 'border-zinc-200 dark:border-zinc-800'}`} />
                </div>

                {/* Charts & Analytics */}
                <div className="premium-card p-8 bg-zinc-50/30 dark:bg-zinc-950/20 backdrop-blur-md border border-blue-500/10 mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <PieChartIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Operational Intelligence</h2>
                    </div>
                    <AnalyticsCharts
                        volunteersByGroup={stats.volunteersByGroupData}
                        shiftFillStatus={stats.shiftFillStatusData}
                    />
                </div>

                {/* Core Management Modules - Live Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Live Feed Widget */}
                    <div className="premium-card p-8 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Live Feed</h3>
                            <Link href={`/events/${id}/checkin`} className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {stats.recentCheckIns && stats.recentCheckIns.length > 0 ? (
                                stats.recentCheckIns.map((checkin: { id: string; name: string }) => (
                                    <div key={checkin.id} className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">
                                            {checkin.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{checkin.name}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Checked In • Just Now</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 italic">No recent check-ins recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Action: Shifts */}
                    <Link href={`/events/${id}/shifts`} className="premium-card p-8 group border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors mb-3">Shifts</h3>
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-300 leading-relaxed italic mb-6">
                            Configure timelines and recruitment targets.
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Manage Board</span>
                            <Calendar className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </Link>

                    {/* Quick Export Widget - Consolidated */}
                    <Link href={`/events/${id}/reports`} className="premium-card p-8 group border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">Quick Export</h3>
                            <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-colors">
                                <FileBarChart className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-300 leading-relaxed italic mb-8">
                            Generate instance reports and detailed shift summaries.
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 transition-colors">Go to Reports</span>
                            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Other Modules */}
                    {[
                        { name: 'Volunteers', desc: 'Member profiles and CSV controls.', href: `/events/${id}/volunteers`, icon: GraduationCap },
                        { name: 'Assets', desc: 'Vest and equipment inventory.', href: `/events/${id}/assets`, icon: Zap },
                        { name: 'Assignments', desc: 'Roster auto-optimization.', href: `/events/${id}/assign`, icon: Zap },
                    ].map((module) => (
                        <Link
                            key={module.name}
                            href={module.href}
                            className="premium-card p-8 group border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">
                                    {module.name}
                                </h3>
                                <module.icon className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" strokeWidth={2.5} />
                            </div>
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-300 leading-relaxed italic">
                                {module.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
