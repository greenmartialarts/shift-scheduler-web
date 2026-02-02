'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assignVolunteer, unassignVolunteer, autoAssign, swapAssignments, clearAssignments, unfillShift, fillShiftFromGroup } from './actions'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/NotificationProvider'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

import { GroupBadge } from '@/components/ui/GroupBadge'

export type Volunteer = {
    id: string
    name: string
    group: string | null
    max_hours?: number | null
}

export type Assignment = {
    id: string
    shift_id: string
    volunteer_id: string
    volunteer?: Volunteer // Joined
}

export type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups?: Record<string, unknown> | string[] | null
    assignments?: Assignment[] // Joined
}

export default function AssignmentManager({
    eventId,
    shifts,
    volunteers,
}: {
    eventId: string
    shifts: Shift[]
    volunteers: Volunteer[]
}) {
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null) // For swapping
    const [fairnessScore, setFairnessScore] = useState<number | null>(null)
    const [apiConflicts, setApiConflicts] = useState<Array<{ shift_id: string, group: string, reasons: string[] }>>([])
    const router = useRouter()
    const { showAlert, showConfirm } = useNotification()
    const lastManualUpdateRef = useRef<number>(0)

    useEffect(() => {
        let refreshTimeout: NodeJS.Timeout
        const supabase = createClient()
        const channel = supabase
            .channel('assignments_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'assignments'
                },
                () => {
                    // Debounce refreshes to handle bulk changes (like Clear All)
                    clearTimeout(refreshTimeout)
                    refreshTimeout = setTimeout(() => {
                        // Avoid refreshing if there's a recent manual update to prevent state loss
                        if (Date.now() - lastManualUpdateRef.current > 2000) {
                            router.refresh()
                        }
                    }, 500)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            clearTimeout(refreshTimeout)
        }
    }, [router])

    // --- Conflict Detection Logic ---
    const conflicts = new Map<string, string[]>() // shiftId -> messages

    // 1. Group assignments by volunteer
    const volunteerAssignments = new Map<string, { shiftId: string, start: number, end: number }[]>()

    shifts.forEach(shift => {
        if (!shift.assignments) return
        const start = new Date(shift.start_time).getTime()
        const end = new Date(shift.end_time).getTime()

        shift.assignments.forEach(assignment => {
            if (!assignment.volunteer_id) return
            const list = volunteerAssignments.get(assignment.volunteer_id) || []
            list.push({ shiftId: shift.id, start, end })
            volunteerAssignments.set(assignment.volunteer_id, list)
        })
    })

    // 2. Check for overlaps
    volunteerAssignments.forEach((assignments, volunteerId) => {
        for (let i = 0; i < assignments.length; i++) {
            for (let j = i + 1; j < assignments.length; j++) {
                const a = assignments[i]
                const b = assignments[j]

                // Check overlap: StartA < EndB && StartB < EndA
                if (a.start < b.end && b.start < a.end) {
                    // Conflict found!
                    const vol = volunteers.find(v => v.id === volunteerId)
                    const volName = vol ? vol.name : 'Volunteer'

                    const msg = `Overlap: ${volName} is double-booked (overlapping shifts).`

                    const existingA = conflicts.get(a.shiftId) || []
                    if (!existingA.includes(msg)) conflicts.set(a.shiftId, [...existingA, msg])

                    const existingB = conflicts.get(b.shiftId) || []
                    if (!existingB.includes(msg)) conflicts.set(b.shiftId, [...existingB, msg])
                }
            }
        }
    })

    // 3. Check max hours exceeded per volunteer
    const volunteerHours = new Map<string, number>()
    shifts.forEach(shift => {
        const start = new Date(shift.start_time).getTime()
        const end = new Date(shift.end_time).getTime()
        const hours = (end - start) / (1000 * 60 * 60)
        shift.assignments?.forEach(a => {
            if (a.volunteer_id) {
                volunteerHours.set(a.volunteer_id, (volunteerHours.get(a.volunteer_id) || 0) + hours)
            }
        })
    })
    volunteerHours.forEach((totalHours, volunteerId) => {
        const vol = volunteers.find(v => v.id === volunteerId)
        if (!vol || vol.max_hours == null || totalHours <= vol.max_hours) return
        const msg = `Max hours: ${vol.name} exceeds limit (${totalHours.toFixed(1)} / ${vol.max_hours} hrs).`
        volunteerAssignments.get(volunteerId)?.forEach(({ shiftId }) => {
            const existing = conflicts.get(shiftId) || []
            if (!existing.includes(msg)) conflicts.set(shiftId, [...existing, msg])
        })
    })

    // --- Unfilled Detection Logic ---
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

    // --- Deduplication & Filtering ---
    // Use a Map to deduplicate shifts by ID if they were duplicated in the query
    const uniqueShifts = Array.from(new Map(shifts.map(s => [s.id, s])).values())

    // --- Unfilled Detection Logic ---
    const unfilledShiftIds = new Set<string>()
    const emptyShiftIds = new Set<string>()
    uniqueShifts.forEach(shift => {
        const requiredGroups = normalizeGroups(shift.required_groups)
        let totalRequired = 0
        for (const count of Object.values(requiredGroups)) {
            totalRequired += Number(count)
        }

        if (totalRequired > 0) {
            const currentAssignments = shift.assignments?.length || 0
            if (currentAssignments === 0) {
                emptyShiftIds.add(shift.id)
            } else if (currentAssignments < totalRequired) {
                unfilledShiftIds.add(shift.id)
            }
        }
    })

    const groups = Array.from(new Set(volunteers.map((v) => v.group).filter(Boolean))) as string[]

    const filteredShifts = uniqueShifts.filter((s) => {
        const start = new Date(s.start_time).toLocaleString()
        const searchLower = search.toLowerCase()
        return (
            (s.name && s.name.toLowerCase().includes(searchLower)) ||
            start.toLowerCase().includes(searchLower) ||
            s.assignments?.some(a => a.volunteer?.name.toLowerCase().includes(searchLower))
        )
    }).sort((a, b) => {
        // Stable Sort Order:
        // 1. Has conflicts (High priority)
        // 2. Is partial filled (High priority)
        // 3. Is completely empty (Medium priority)
        // 4. Chronological (Standard)
        // 5. Name/ID (Tie-breaker)

        const aHasConflict = conflicts.has(a.id)
        const bHasConflict = conflicts.has(b.id)
        if (aHasConflict !== bHasConflict) return aHasConflict ? -1 : 1

        const aPartial = unfilledShiftIds.has(a.id)
        const bPartial = unfilledShiftIds.has(b.id)
        if (aPartial !== bPartial) return aPartial ? -1 : 1

        const aEmpty = emptyShiftIds.has(a.id)
        const bEmpty = emptyShiftIds.has(b.id)
        if (aEmpty !== bEmpty) return aEmpty ? -1 : 1

        const aTime = new Date(a.start_time).getTime()
        const bTime = new Date(b.start_time).getTime()
        if (aTime !== bTime) return aTime - bTime

        const aName = a.name || ''
        const bName = b.name || ''
        if (aName !== bName) return aName.localeCompare(bName)

        return a.id.localeCompare(b.id)
    })

    async function handleAutoAssign() {
        setLoading(true)
        const res = await autoAssign(eventId)

        if (res?.error) {
            setLoading(false)
            showAlert('Error: ' + res.error, 'error')
        } else {
            setFairnessScore(res.fairnessScore)
            setApiConflicts(res.conflicts || [])
            showAlert(res.message || 'Auto-assignment completed', res.partial ? 'warning' : 'success')

            // Mark a manual update to prevent real-time refresh stomp
            lastManualUpdateRef.current = Date.now()

            router.refresh()
            setLoading(false)
        }
    }

    async function handleClearAssignments() {
        const confirmed = await showConfirm({
            title: 'Clear All Assignments',
            message: 'Are you sure you want to remove ALL assignments? This cannot be undone.',
            confirmText: 'Clear All',
            type: 'danger'
        })
        if (!confirmed) return
        setLoading(true)
        const res = await clearAssignments(eventId)
        if (res?.error) {
            setLoading(false)
            showAlert(res.error, 'error')
        } else {
            // Mark manual update to prevent real-time stomp
            lastManualUpdateRef.current = Date.now()

            // Clear local state immediately
            setFairnessScore(null)
            setApiConflicts([])

            router.refresh()
            setLoading(false)
            showAlert('All assignments cleared', 'success')
        }
    }

    async function handleAssign(shiftId: string, volunteerId: string) {
        if (!volunteerId) return
        setActionLoading(`assign-${shiftId}`)
        const res = await assignVolunteer(shiftId, volunteerId)
        if (res?.error) {
            setActionLoading(null)
            showAlert(res.error, 'error')
        } else {
            // eslint-disable-next-line react-hooks/purity
            lastManualUpdateRef.current = Date.now()
            router.refresh()
            setActionLoading(null)
        }
    }

    async function handleUnassign(assignmentId: string) {
        const confirmed = await showConfirm({
            title: 'Unassign Volunteer',
            message: 'Are you sure you want to unassign this volunteer?',
            confirmText: 'Unassign',
            type: 'danger'
        })
        if (!confirmed) return
        setActionLoading(`unassign-${assignmentId}`)
        const res = await unassignVolunteer(assignmentId)
        if (res?.error) {
            setActionLoading(null)
            showAlert(res.error, 'error')
        } else {
            lastManualUpdateRef.current = Date.now()
            router.refresh()
            setActionLoading(null)
        }
    }

    async function handleSwap(assignmentId: string) {
        if (selectedAssignment === null) {
            setSelectedAssignment(assignmentId)
        } else {
            if (selectedAssignment === assignmentId) {
                setSelectedAssignment(null) // Deselect
                return
            }
            // Swap
            const res = await swapAssignments(selectedAssignment, assignmentId)
            if (res?.error) showAlert(res.error, 'error')
            else {
                // eslint-disable-next-line react-hooks/purity
                lastManualUpdateRef.current = Date.now()
                router.refresh()
                setSelectedAssignment(null)
            }
        }
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    placeholder="Search shifts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-xs dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 transition-all duration-200"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleAutoAssign}
                        disabled={loading}
                        className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                    >
                        {loading ? 'Assigning...' : 'Auto Assign'}
                    </button>
                    <button
                        onClick={handleClearAssignments}
                        disabled={loading}
                        className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-6 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-all duration-200"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {fairnessScore !== null && (
                <div className="mb-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Schedule Fairness</h4>
                            <div className="flex items-end gap-3">
                                <span className={`text-4xl font-black ${fairnessScore > 90 ? 'text-emerald-500' :
                                    fairnessScore > 70 ? 'text-blue-500' :
                                        fairnessScore > 50 ? 'text-yellow-500' :
                                            'text-red-500'
                                    }`}>
                                    {fairnessScore.toFixed(1)}%
                                </span>
                                <span className={`text-lg font-bold mb-1 ${fairnessScore > 90 ? 'text-emerald-600' :
                                    fairnessScore > 70 ? 'text-blue-600' :
                                        fairnessScore > 50 ? 'text-yellow-600' :
                                            'text-red-600'
                                    }`}>
                                    {fairnessScore > 90 ? '🌟 Excellent' :
                                        fairnessScore > 70 ? '✅ Good' :
                                            fairnessScore > 50 ? '⚠️ Fair' :
                                                '❗ Imbalanced'}
                                </span>
                            </div>

                            <div className="mt-4 h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(5, Math.min(100, fairnessScore))}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${fairnessScore > 90 ? 'bg-emerald-500' :
                                        fairnessScore > 70 ? 'bg-blue-500' :
                                            fairnessScore > 50 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                        }`}
                                />
                            </div>
                            <p className="text-xs text-zinc-400 mt-2 font-medium">
                                {fairnessScore > 90 ? 'Workload is perfectly balanced across volunteers.' :
                                    fairnessScore > 70 ? 'Workload distribution is good, with minor variations.' :
                                        fairnessScore > 50 ? 'Some volunteers are working significantly more than others.' :
                                            'Critical imbalance detected. Review assignments immediately.'}
                            </p>
                        </div>

                        {apiConflicts.length > 0 && (
                            <div className="flex-1 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
                                <h5 className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-200 uppercase tracking-wide mb-3">
                                    <span>🚨 Global Scheduling Insights</span>
                                    <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 text-[10px] px-2 py-0.5 rounded-full">{apiConflicts.length} Issues</span>
                                </h5>
                                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    <ul className="space-y-2">
                                        {(() => {
                                            const allReasons = apiConflicts.flatMap(c => c.reasons)
                                            const aggregatedHelper = new Map<string, { min: number, max: number, count: number }>()
                                            const rawDedupe = new Set<string>()

                                            allReasons.forEach(reason => {
                                                const match = reason.match(/(\d+)/)
                                                if (match) {
                                                    const num = parseInt(match[1], 10)
                                                    const key = reason.replace(match[1], '{n}')
                                                    const existing = aggregatedHelper.get(key)

                                                    if (existing) {
                                                        aggregatedHelper.set(key, {
                                                            min: Math.min(existing.min, num),
                                                            max: Math.max(existing.max, num),
                                                            count: existing.count + 1
                                                        })
                                                    } else {
                                                        aggregatedHelper.set(key, { min: num, max: num, count: 1 })
                                                    }
                                                } else {
                                                    rawDedupe.add(reason)
                                                }
                                            })

                                            const aggregatedItems = Array.from(aggregatedHelper.entries()).map(([key, stats]) => {
                                                const valStr = stats.min === stats.max
                                                    ? stats.max.toString()
                                                    : `${stats.min}-${stats.max}`
                                                return key.replace('{n}', valStr)
                                            })

                                            const finalItems = [...aggregatedItems, ...Array.from(rawDedupe)]

                                            return finalItems.map((text, i) => (
                                                <li key={i} className="text-sm font-medium text-red-700 dark:text-red-300 flex items-start gap-2">
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                                                    {text}
                                                </li>
                                            ))
                                        })()}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedAssignment && (
                <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                    Select another assignment to swap with. <button onClick={() => setSelectedAssignment(null)} className="underline">Cancel</button>
                </div>
            )}

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredShifts.map((shift) => {
                        const shiftConflicts = conflicts.get(shift.id)
                        const isUnfilled = unfilledShiftIds.has(shift.id)

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={shift.id}
                                className={`rounded-3xl p-6 transition-all duration-300 ${shiftConflicts ? 'bg-yellow-50/50 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800 shadow-lg shadow-yellow-500/5' :
                                    isUnfilled ? 'bg-orange-50/50 border border-orange-200 dark:bg-orange-900/10 dark:border-orange-800 shadow-lg shadow-orange-500/5' :
                                        'glass-panel hover:shadow-2xl hover:shadow-purple-500/15 dark:hover:shadow-purple-500/20'
                                    }`}
                            >
                                {shiftConflicts && (
                                    <div className="mb-4 rounded-md bg-yellow-100 p-3 text-sm text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                                        <p className="font-bold">⚠️ Scheduling Conflicts:</p>
                                        <ul className="list-disc pl-5">
                                            {shiftConflicts.map((msg, i) => (
                                                <li key={i}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {emptyShiftIds.has(shift.id) && !shiftConflicts && (
                                    <div className="mb-4 rounded-md bg-orange-100 p-3 text-sm text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                                        <p className="font-bold">⚠️ Shift has not been filled, try auto assigning</p>
                                    </div>
                                )}

                                {unfilledShiftIds.has(shift.id) && !shiftConflicts && (
                                    <div className="mb-4 rounded-md bg-orange-100 p-3 text-sm text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                                        <p className="font-bold">⚠️ Needs More Volunteers:</p>
                                        <p>This shift is currently under-staffed.</p>
                                    </div>
                                )}



                                <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                            {shift.name && <span className="text-zinc-400 uppercase tracking-tighter text-xs">{shift.name}</span>}
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </h3>
                                        <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest italic">
                                            {new Date(shift.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {(() => {
                                                const reqs = normalizeGroups(shift.required_groups)
                                                if (Object.keys(reqs).length === 0) {
                                                    return <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">Global Access</span>
                                                }
                                                return Object.entries(reqs).map(([name, count]) => (
                                                    <GroupBadge key={name} name={name} count={count} />
                                                ))
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {groups.length > 0 && (
                                            <select
                                                disabled={!!actionLoading}
                                                className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
                                                value=""
                                                onChange={async (e) => {
                                                    const group = e.target.value
                                                    if (!group) return
                                                    e.target.value = ''
                                                    setActionLoading(`fill-${shift.id}`)
                                                    const res = await fillShiftFromGroup(shift.id, group, eventId)
                                                    setActionLoading(null)
                                                    if (res?.error) showAlert(res.error, 'error')
                                                    else if (res?.message) showAlert(res.message, res.assigned ? 'success' : 'warning')
                                                    lastManualUpdateRef.current = Date.now()
                                                    router.refresh()
                                                }}
                                            >
                                                <option value="">Fill from group</option>
                                                {groups.map((g) => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        )}
                                        {(shift.assignments?.length ?? 0) > 0 && (
                                            <button
                                                type="button"
                                                disabled={!!actionLoading}
                                                className="rounded-md border border-red-200 dark:border-red-800 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                                onClick={async () => {
                                                    const ok = await showConfirm({ title: 'Unfill shift', message: 'Remove all volunteers from this shift?', confirmText: 'Unfill', type: 'danger' })
                                                    if (!ok) return
                                                    setActionLoading(`unfill-${shift.id}`)
                                                    const res = await unfillShift(shift.id)
                                                    setActionLoading(null)
                                                    if (res?.error) showAlert(res.error, 'error')
                                                    else { lastManualUpdateRef.current = Date.now(); router.refresh(); showAlert('Shift unfilled', 'success') }
                                                }}
                                            >
                                                Unfill shift
                                            </button>
                                        )}
                                        {actionLoading === `assign-${shift.id}` ? (
                                            <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <select
                                                disabled={!!actionLoading}
                                                className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
                                                onChange={(e) => handleAssign(shift.id, e.target.value)}
                                                value=""
                                            >
                                                <option value="">+ Add Volunteer</option>
                                                {volunteers.map((v) => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {shift.assignments?.map((assignment) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={assignment.id}
                                                className={`flex items-center justify-between rounded-md border p-3 transition-colors duration-200 ${selectedAssignment === assignment.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 'border-gray-200 dark:border-gray-700'
                                                    } ${actionLoading === `unassign-${assignment.id}` ? 'opacity-50' : ''}`}
                                            >
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {assignment.volunteer?.name || 'Unknown Volunteer'}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSwap(assignment.id)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        {selectedAssignment === assignment.id ? 'Selected' : 'Swap'}
                                                    </button>
                                                    <button
                                                        disabled={!!actionLoading}
                                                        onClick={() => handleUnassign(assignment.id)}
                                                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                    >
                                                        {actionLoading === `unassign-${assignment.id}` ? '...' : 'Remove'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {(!shift.assignments || shift.assignments.length === 0) && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No volunteers assigned.</p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {filteredShifts.length === 0 && (
                    <div className="premium-card p-12 text-center">
                        <div className="flex flex-col items-center gap-4 text-zinc-500 dark:text-zinc-400">
                            <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 italic">No Shifts Found</h3>
                                <p className="text-sm font-medium mt-1">Please create shifts first to manage assignments.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
