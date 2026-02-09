import { createClient } from '@/lib/supabase/server'


interface ShiftAssignment {
    id: string
    checked_in: boolean
    checked_out_at: string | null
    late_dismissed: boolean
    shift_id: string
}

export async function getDashboardStats(eventId: string) {
    const supabase = await createClient()

    const [
        { count: totalVolunteers, data: volunteers },
        { data: shifts },
    ] = await Promise.all([
        supabase.from('volunteers').select('group', { count: 'exact' }).eq('event_id', eventId),
        supabase.from('shifts').select('id, start_time, end_time, required_groups').eq('event_id', eventId),
    ])

    const shiftIds = shifts?.map(s => s.id) || [];
    let eventAssignments: ShiftAssignment[] = [];
    if (shiftIds.length > 0) {
        const { data } = await supabase
            .from('assignments')
            .select('id, checked_in, checked_out_at, late_dismissed, shift_id')
            .in('shift_id', shiftIds);
        eventAssignments = (data || []) as ShiftAssignment[];
    }

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

    return {
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
    }
}
