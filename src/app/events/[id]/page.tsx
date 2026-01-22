"use client";

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Calendar, AlertTriangle, PieChart as PieChartIcon, Zap } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { CloneEventModal } from '@/components/dashboard/CloneEventModal'

interface Event {
    id: string
    name: string
    date: string
}

interface Stats {
    totalVolunteersCount: number
    totalShiftsCount: number
    totalSlots: number
    filledSlotsCount: number
    fillRate: number
    totalHours: number
    checkedInCount: number
    activeCurrentlyCount: number
    lateCount: number
    volunteersByGroupData: { name: string; value: number }[]
    shiftFillStatusData: { name: string; value: number }[]
}

interface ShiftAssignment {
    id: string
    checked_in: boolean
    checked_out_at: string | null
    late_dismissed: boolean
    shift_id: string
}

export default function EventDashboard({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const resolvedParams = use(params)
    const id = resolvedParams.id
    const [event, setEvent] = useState<Event | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return;

        async function loadData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: eventData } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single()

            if (!eventData) {
                router.push('/events')
                return
            }
            setEvent(eventData)

            // Fetch data for analytics
            const [
                { count: totalVolunteers, data: volunteers },
                { data: shifts },
            ] = await Promise.all([
                supabase.from('volunteers').select('group', { count: 'exact' }).eq('event_id', id),
                supabase.from('shifts').select('id, start_time, end_time, required_groups').eq('event_id', id),
            ])

            // Re-fetch assignments properly
            const shiftIds = shifts?.map(s => s.id) || [];
            let eventAssignments: ShiftAssignment[] = [];
            if (shiftIds.length > 0) {
                const { data } = await supabase
                    .from('assignments')
                    .select('id, checked_in, checked_out_at, late_dismissed, shift_id')
                    .in('shift_id', shiftIds);
                eventAssignments = (data || []) as ShiftAssignment[];
            }

            // Helper to normalize required_groups to dictionary format
            const normalizeGroups = (groups: unknown): Record<string, number> => {
                if (!groups) return {}
                if (typeof groups === 'object' && !Array.isArray(groups)) return groups as Record<string, number>

                const normalized: Record<string, number> = {}
                const items = Array.isArray(groups) ? groups : [groups.toString()]

                items.forEach((item: string) => {
                    if (item.includes(':')) {
                        const [group, count] = item.split(':')
                        if (group && count) normalized[group.trim()] = parseInt(count) || 0
                    } else {
                        normalized[item.trim()] = 1
                    }
                })
                return normalized
            }

            // Calculate Metrics
            let totalSlots = 0;
            shifts?.forEach(shift => {
                const required = normalizeGroups(shift.required_groups);
                if (required) {
                    Object.values(required).forEach(count => {
                        totalSlots += Number(count) || 0;
                    });
                }
            });

            const filledSlotsCount = eventAssignments.length;
            const fillRate = totalSlots > 0 ? (filledSlotsCount / totalSlots) * 100 : 0;

            let totalHours = 0;
            shifts?.forEach(shift => {
                const start = new Date(shift.start_time).getTime();
                const end = new Date(shift.end_time).getTime();
                totalHours += (end - start) / (1000 * 60 * 60);
            });

            const now = new Date();
            const lateCount = eventAssignments.filter(a => {
                if (a.checked_in) return false;
                const shift = shifts?.find(s => s.id === a.shift_id);
                if (!shift) return false;
                return new Date(shift.start_time) < now;
            }).length;

            const volunteersByGroupMap = new Map<string, number>();
            volunteers?.forEach(v => {
                const group = v.group || 'Unassigned';
                volunteersByGroupMap.set(group, (volunteersByGroupMap.get(group) || 0) + 1);
            });

            setStats({
                totalVolunteersCount: totalVolunteers || 0,
                totalShiftsCount: shifts?.length || 0,
                totalSlots,
                filledSlotsCount,
                fillRate,
                totalHours,
                checkedInCount: eventAssignments.filter(a => a.checked_in).length,
                activeCurrentlyCount: eventAssignments.filter(a => a.checked_in && !a.checked_out_at).length,
                lateCount,
                volunteersByGroupData: Array.from(volunteersByGroupMap.entries()).map(([name, value]) => ({ name, value })),
                shiftFillStatusData: [
                    { name: 'Filled', value: filledSlotsCount },
                    { name: 'Unfilled', value: Math.max(0, totalSlots - filledSlotsCount) },
                ]
            })
            setLoading(false)
        }
        loadData()
    }, [id, router])

    if (loading || !event || !stats) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

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
                            className="button-premium"
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
                <div id="stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Fill Rate', value: `${Math.round(stats.fillRate)}%`, sub: `${stats.filledSlotsCount} / ${stats.totalSlots}`, color: stats.fillRate >= 80 ? 'text-green-500' : stats.fillRate >= 50 ? 'text-yellow-500' : 'text-red-500' },
                        { label: 'Volunteers', value: stats.totalVolunteersCount, sub: 'Registered members' },
                        { label: 'Hours Tracked', value: Math.round(stats.totalHours), sub: 'Projected demand' },
                        { label: 'Active Personnel', value: stats.activeCurrentlyCount, sub: 'Currently on-site', color: 'text-green-500', href: `/events/${id}/active` },
                    ].map((stat) => (
                        stat.href ? (
                            <Link key={stat.label} href={stat.href} className="premium-card p-6 block hover:border-indigo-500/30 transition-all">
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
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <StatCard label="Total Shifts" value={stats.totalShiftsCount} icon={Calendar} className="premium-card" />
                    <StatCard label="Total Slots" value={stats.totalSlots} icon={Users} className="premium-card" />
                    <StatCard label="Late Arrivals" value={stats.lateCount} icon={AlertTriangle} className={`premium-card ${stats.lateCount > 0 ? 'border-red-500/30' : ''}`} />
                </div>

                {/* Charts & Analytics */}
                <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/30 mb-12">
                    <div className="flex items-center gap-2 mb-8">
                        <PieChartIcon className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Operational Intelligence</h2>
                    </div>
                    <AnalyticsCharts
                        volunteersByGroup={stats.volunteersByGroupData}
                        shiftFillStatus={stats.shiftFillStatusData}
                    />
                </div>

                {/* Core Management Modules */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            className={`premium-card p-8 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${module.highlight ? 'ring-2 ring-indigo-500 shadow-indigo-500/20' : ''}`}
                        >
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-3">
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
