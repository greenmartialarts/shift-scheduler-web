'use client'

import { useState } from 'react'
import { assignVolunteer, unassignVolunteer, autoAssign, swapAssignments, clearAssignments } from './actions'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/NotificationProvider'

type Volunteer = {
    id: string
    name: string
    group: string | null
}

type Assignment = {
    id: string
    shift_id: string
    volunteer_id: string
    volunteer?: Volunteer // Joined
}

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
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
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null) // For swapping
    const router = useRouter()
    const { showAlert, showConfirm } = useNotification()

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

                    const msg = `Conflict: ${volName} is double-booked.`

                    const existingA = conflicts.get(a.shiftId) || []
                    if (!existingA.includes(msg)) conflicts.set(a.shiftId, [...existingA, msg])

                    const existingB = conflicts.get(b.shiftId) || []
                    if (!existingB.includes(msg)) conflicts.set(b.shiftId, [...existingB, msg])
                }
            }
        }
    })

    // --- Unfilled Detection Logic ---
    // We check if assignments count matches required count
    const unfilledShiftIds = new Set<string>()
    shifts.forEach(shift => {
        // @ts-ignore
        const requiredGroups = shift.required_groups || {}
        let totalRequired = 0
        for (const count of Object.values(requiredGroups)) {
            totalRequired += Number(count)
        }

        // If no requirements specified, assume 1 per shift if allowed_groups is set, or just skip?
        // Let's assume if totalRequired > 0, we check.
        if (totalRequired > 0) {
            const currentAssignments = shift.assignments?.length || 0
            if (currentAssignments < totalRequired) {
                unfilledShiftIds.add(shift.id)
            }
        }
    })

    const filteredShifts = shifts.filter((s) => {
        const start = new Date(s.start_time).toLocaleString()
        const searchLower = search.toLowerCase()
        return (
            (s.name && s.name.toLowerCase().includes(searchLower)) ||
            start.toLowerCase().includes(searchLower) ||
            s.assignments?.some(a => a.volunteer?.name.toLowerCase().includes(searchLower))
        )
    }).sort((a, b) => {
        // Sort order:
        // 1. Has conflicts (High priority)
        // 2. Is unfilled (High priority)
        // 3. Chronological (Standard)

        const aHasConflict = conflicts.has(a.id)
        const bHasConflict = conflicts.has(b.id)
        if (aHasConflict && !bHasConflict) return -1
        if (!aHasConflict && bHasConflict) return 1

        const aUnfilled = unfilledShiftIds.has(a.id)
        const bUnfilled = unfilledShiftIds.has(b.id)
        if (aUnfilled && !bUnfilled) return -1
        if (!aUnfilled && bUnfilled) return 1

        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })

    async function handleAutoAssign() {
        setLoading(true)
        const res = await autoAssign(eventId)
        setLoading(false)

        if (res?.error) {
            showAlert('Error: ' + res.error, 'error')
        } else if (res?.partial && res?.unfilled) {
            // Partial assignment - some shifts couldn't be filled
            const unfilledDetails = res.unfilled
                .map(([shiftId, group, count]: [string, string, number]) => {
                    const shift = shifts.find(s => s.id === shiftId)
                    const timeStr = shift
                        ? new Date(shift.start_time).toLocaleString()
                        : shiftId
                    return `  • ${timeStr}: Need ${count} more ${group}`
                })
                .join('\n')

            showAlert(
                `Partial Assignment Complete. Some shifts were filled, but some positions remain unfilled. These are highlighted in orange.`,
                'warning'
            )
            router.refresh()
        } else {
            showAlert('Auto-assignment complete! All shifts filled successfully.', 'success')
            router.refresh()
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
        setLoading(false)
        if (res?.error) showAlert(res.error, 'error')
        else {
            showAlert('All assignments cleared.', 'success')
            router.refresh()
        }
    }

    async function handleAssign(shiftId: string, volunteerId: string) {
        if (!volunteerId) return
        const res = await assignVolunteer(shiftId, volunteerId)
        if (res?.error) showAlert(res.error, 'error')
        else router.refresh()
    }

    async function handleUnassign(assignmentId: string) {
        const confirmed = await showConfirm({
            title: 'Unassign Volunteer',
            message: 'Are you sure you want to unassign this volunteer?',
            confirmText: 'Unassign',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await unassignVolunteer(assignmentId)
        if (res?.error) showAlert(res.error, 'error')
        else router.refresh()
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
                setSelectedAssignment(null)
                showAlert('Assignments swapped successfully', 'success')
                router.refresh()
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
                        className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02]"
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

            {selectedAssignment && (
                <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                    Select another assignment to swap with. <button onClick={() => setSelectedAssignment(null)} className="underline">Cancel</button>
                </div>
            )}

            <div className="grid gap-6">
                {filteredShifts.map((shift) => {
                    const shiftConflicts = conflicts.get(shift.id)
                    const isUnfilled = unfilledShiftIds.has(shift.id)

                    return (
                        <div key={shift.id} className={`rounded-3xl p-6 transition-all duration-300 ${shiftConflicts ? 'bg-yellow-50/50 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800 shadow-lg shadow-yellow-500/5' :
                            isUnfilled ? 'bg-orange-50/50 border border-orange-200 dark:bg-orange-900/10 dark:border-orange-800 shadow-lg shadow-orange-500/5' :
                                'glass-panel hover:shadow-2xl hover:shadow-indigo-500/5'
                            }`}>
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

                            {isUnfilled && !shiftConflicts && (
                                <div className="mb-4 rounded-md bg-orange-100 p-3 text-sm text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                                    <p className="font-bold">⚠️ Auto-Assign Incomplete:</p>
                                    <p>This shift could not be fully filled.</p>
                                </div>
                            )}

                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {shift.name && <span className="font-bold mr-2">{shift.name}:</span>}
                                    {new Date(shift.start_time).toLocaleString()} - {new Date(shift.end_time).toLocaleTimeString()}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
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
                                </div>
                            </div>

                            <div className="space-y-2">
                                {shift.assignments?.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className={`flex items-center justify-between rounded-md border p-3 transition-colors duration-200 ${selectedAssignment === assignment.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 'border-gray-200 dark:border-gray-700'
                                            }`}
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
                                                onClick={() => handleUnassign(assignment.id)}
                                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!shift.assignments || shift.assignments.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No volunteers assigned.</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
