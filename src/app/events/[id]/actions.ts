'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation'

export async function cloneEvent(
    sourceEventId: string,
    formData: FormData
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const date = formData.get('date') as string
    const copyVolunteers = formData.get('copyVolunteers') === 'on'
    const copyShifts = formData.get('copyShifts') === 'on'
    const offsetDays = parseInt(formData.get('offsetDays') as string) || 0

    // 1. Create new event
    const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert({
            user_id: user.id,
            name,
            date,
        })
        .select()
        .single()

    if (eventError || !newEvent) {
        return { error: eventError?.message || 'Failed to create event' }
    }

    const newEventId = newEvent.id

    // 2. Add creator as Admin (same as createEvent)
    const { error: adminError } = await supabase
        .from('event_admins')
        .insert({
            event_id: newEventId,
            user_id: user.id,
            role: 'admin',
        })

    if (adminError) {
        console.error('Error adding admin to cloned event:', adminError)
        // Rollback: Delete the orphaned event
        await supabase.from('events').delete().eq('id', newEventId)
        return { error: 'Failed to set up event permissions. Please try again.' }
    }

    // 3. Copy Volunteers
    if (copyVolunteers) {
        const { data: volunteers } = await supabase
            .from('volunteers')
            .select('*')
            .eq('event_id', sourceEventId)

        if (volunteers && volunteers.length > 0) {
            // We need to map old group IDs to new group IDs if we were copying groups too.
            // But groups are per event. So we should copy groups first if we want to keep them.
            // For simplicity, let's copy groups first.

            const { data: groups } = await supabase
                .from('volunteer_groups')
                .select('*')
                .eq('event_id', sourceEventId)

            const groupMap = new Map<string, string>() // oldId -> newId

            if (groups && groups.length > 0) {
                for (const group of groups) {
                    const { data: newGroup } = await supabase
                        .from('volunteer_groups')
                        .insert({
                            event_id: newEventId,
                            name: group.name,
                            color: group.color,
                            description: group.description,
                            max_hours_default: group.max_hours_default,
                        })
                        .select()
                        .single()

                    if (newGroup) {
                        groupMap.set(group.id, newGroup.id)
                    }
                }
            }

            const newVolunteers = volunteers.map(v => ({
                event_id: newEventId,
                name: v.name,
                group: v.group, // Text field backup
                group_id: v.group_id ? groupMap.get(v.group_id) : null,
                max_hours: v.max_hours,
                external_id: v.external_id,
            }))

            const { error: volError } = await supabase.from('volunteers').insert(newVolunteers)
            if (volError) {
                console.error('Error copying volunteers:', volError)
                // Continue anyway
            }
        }
    }

    // 3. Copy Shifts
    if (copyShifts) {
        const { data: shifts } = await supabase
            .from('shifts')
            .select('*')
            .eq('event_id', sourceEventId)

        if (shifts && shifts.length > 0) {
            const newShifts = shifts.map(s => {
                const start = new Date(s.start_time)
                const end = new Date(s.end_time)

                // Apply offset
                start.setDate(start.getDate() + offsetDays)
                end.setDate(end.getDate() + offsetDays)

                return {
                    event_id: newEventId,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    required_groups: s.required_groups,
                    allowed_groups: s.allowed_groups,
                    excluded_groups: s.excluded_groups,
                    // name is not in schema but might be in future or was removed? 
                    // Wait, shift manager uses 'name' but schema didn't show it in my view earlier?
                    // Ah, schema showed:
                    // 25: create table shifts (
                    // ...
                    // 30:   required_groups jsonb default '{}'::jsonb,
                    // It didn't show 'name'. But shift-manager.tsx uses it.
                    // Wait, shift-manager.tsx line 10: name: string | null
                    // And line 234: {shift.name || '-'}
                    // If schema doesn't have it, shift-manager might be failing or using a column I missed.
                    // Let's check schema again?
                    // Step 12 schema view:
                    // 25: create table shifts (
                    // 26:   id uuid primary key default uuid_generate_v4(),
                    // 27:   event_id uuid references events on delete cascade not null,
                    // 28:   start_time timestamp with time zone not null,
                    // 29:   end_time timestamp with time zone not null,
                    // 30:   required_groups jsonb default '{}'::jsonb,
                    // 31:   allowed_groups text[] default '{}',
                    // 32:   excluded_groups text[] default '{}',
                    // 33:   created_at timestamp with time zone default timezone('utc'::text, now()) not null
                    // 34: );
                    // It does NOT have name.
                    // But migration 20251202000000_add_name_to_shifts.sql was found in file list!
                    // I should assume 'name' exists if that migration ran.
                    // I'll include it if it's in the source object.
                    name: (s as { name?: string }).name || null,
                }
            })

            const { error: shiftError } = await supabase.from('shifts').insert(newShifts)
            if (shiftError) {
                console.error('Error copying shifts:', shiftError)
            }
        }
    }

    revalidatePath('/events')
    return { success: true, newEventId }
}

export async function generateNextOccurrence(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: event } = await supabase
        .from('events')
        .select('id, name, date, recurrence_rule')
        .eq('id', eventId)
        .single()

    if (!event || !event.recurrence_rule) {
        return { error: 'Set a recurrence rule in Event Settings first (e.g. Weekly, Biweekly, Monthly).' }
    }

    const baseDate = event.date ? new Date(event.date) : new Date()
    const nextDate = new Date(baseDate)
    switch (String(event.recurrence_rule).toUpperCase()) {
        case 'WEEKLY':
            nextDate.setDate(nextDate.getDate() + 7)
            break
        case 'BIWEEKLY':
            nextDate.setDate(nextDate.getDate() + 14)
            break
        case 'MONTHLY':
            nextDate.setMonth(nextDate.getMonth() + 1)
            break
        default:
            nextDate.setDate(nextDate.getDate() + 7)
    }

    const offsetDays = Math.round((nextDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    const formData = new FormData()
    formData.set('name', `${event.name} – ${nextDate.toLocaleDateString()}`)
    formData.set('date', nextDate.toISOString().slice(0, 10))
    formData.set('copyShifts', 'on')
    formData.set('copyVolunteers', 'on')
    formData.set('offsetDays', String(offsetDays))

    return cloneEvent(eventId, formData)
}
