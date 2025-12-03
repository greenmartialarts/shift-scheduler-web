import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Users, Calendar, Clock, CheckCircle, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { CloneEventModal } from '@/components/dashboard/CloneEventModal'

export default async function EventDashboard({
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
        .select('*')
        .eq('id', id)
        .single()

    if (!event) {
        notFound()
    }

    // Fetch data for analytics
    const [
        { count: totalVolunteers, data: volunteers },
        { data: shifts },
    ] = await Promise.all([
        supabase.from('volunteers').select('group', { count: 'exact' }).eq('event_id', id),
        supabase.from('shifts').select('id, start_time, end_time, required_groups').eq('event_id', id),
    ])

    // Re-fetch assignments properly by filtering on shifts
    const { data: eventShifts } = await supabase.from('shifts').select('id').eq('event_id', id);
    const shiftIds = eventShifts?.map(s => s.id) || [];

    // Only query assignments if there are shifts
    let eventAssignments: any[] = [];
    if (shiftIds.length > 0) {
        const { data } = await supabase
            .from('assignments')
            .select('id, checked_in, late_dismissed, shift_id')
            .in('shift_id', shiftIds);
        eventAssignments = data || [];
    }

    const realAssignments = eventAssignments || [];
    const realShifts = shifts || [];
    const realVolunteers = volunteers || [];

    // Calculate Metrics
    const totalVolunteersCount = totalVolunteers || 0;
    const totalShiftsCount = realShifts.length;

    // Calculate total slots from required_groups JSON
    let totalSlots = 0;
    realShifts.forEach(shift => {
        const required = shift.required_groups as Record<string, number>;
        if (required) {
            Object.values(required).forEach(count => {
                totalSlots += Number(count) || 0;
            });
        }
    });

    const filledSlotsCount = realAssignments.length;
    const fillRate = totalSlots > 0 ? (filledSlotsCount / totalSlots) * 100 : 0;

    // Calculate total hours
    let totalHours = 0;
    realShifts.forEach(shift => {
        const start = new Date(shift.start_time).getTime();
        const end = new Date(shift.end_time).getTime();
        const durationHours = (end - start) / (1000 * 60 * 60);
        totalHours += durationHours;
    });

    const checkedInCount = realAssignments.filter(a => a.checked_in).length;

    const now = new Date();
    const lateCount = realAssignments.filter(a => {
        if (a.checked_in) return false;
        const shift = realShifts.find(s => s.id === a.shift_id);
        if (!shift) return false;
        return new Date(shift.start_time) < now;
    }).length;

    // Prepare Chart Data
    const volunteersByGroupMap = new Map<string, number>();
    realVolunteers.forEach(v => {
        const group = v.group || 'Unassigned';
        volunteersByGroupMap.set(group, (volunteersByGroupMap.get(group) || 0) + 1);
    });
    const volunteersByGroupData = Array.from(volunteersByGroupMap.entries()).map(([name, value]) => ({ name, value }));

    const shiftFillStatusData = [
        { name: 'Filled', value: filledSlotsCount },
        { name: 'Unfilled', value: Math.max(0, totalSlots - filledSlotsCount) },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link href="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        &larr; Back to Events
                    </Link>
                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{event.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-4">
                            <CloneEventModal eventId={id} eventName={event.name} eventDate={event.date} />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Banner */}
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fill Rate</p>
                        <p className={`text-2xl font-bold ${fillRate >= 80 ? 'text-green-600' : fillRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round(fillRate)}%
                        </p>
                        <p className="text-xs text-gray-400">{filledSlotsCount} / {totalSlots} slots</p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Volunteers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVolunteersCount}</p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hours</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(totalHours)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Checked In</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{checkedInCount}</p>
                    </div>
                </div>

                {/* Main Analytics Grid */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <StatCard
                        label="Total Shifts"
                        value={totalShiftsCount}
                        icon={Calendar}
                    />
                    <StatCard
                        label="Total Slots"
                        value={totalSlots}
                        icon={Users}
                    />
                    <StatCard
                        label="Late Arrivals"
                        value={lateCount}
                        icon={AlertTriangle}
                        className={lateCount > 0 ? 'border-l-4 border-red-500' : ''}
                    />
                </div>

                {/* Charts */}
                <div className="mb-8">
                    <AnalyticsCharts
                        volunteersByGroup={volunteersByGroupData}
                        shiftFillStatus={shiftFillStatusData}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Link
                        href={`/events/${id}/volunteers`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Volunteers
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage volunteers, add individually or bulk upload via CSV.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/shifts`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Shifts
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage shifts, set requirements, and bulk upload.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/assign`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Assignments
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Assign volunteers to shifts manually or use Auto-Assign.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/checkin`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Check-in
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage volunteer attendance and track late arrivals.
                        </p>
                    </Link>

                    <Link
                        href={`/events/${id}/reports`}
                        className="group block rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-colors duration-200"
                    >
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Reports
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Export schedules, track hours, and generate PDFs.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
