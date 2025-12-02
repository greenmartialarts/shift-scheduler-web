'use client'

import { useState } from 'react'
import { toggleCheckIn, dismissLateWarning, undismissLateWarning } from './actions'
import { useRouter } from 'next/navigation'

type Volunteer = {
    id: string
    name: string
}

type Assignment = {
    id: string
    volunteer_id: string
    volunteer?: Volunteer
    checked_in: boolean
    late_dismissed: boolean
}

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    assignments?: Assignment[]
}

export default function CheckinManager({
    eventId,
    shifts,
}: {
    eventId: string
    shifts: Shift[]
}) {
    const [search, setSearch] = useState('')
    const router = useRouter()

    // Helper to determine shift status
    const getShiftStatus = (shift: Shift) => {
        const now = new Date()
        const start = new Date(shift.start_time)
        const end = new Date(shift.end_time)

        const hasAssignments = shift.assignments && shift.assignments.length > 0
        const allCheckedIn = hasAssignments && shift.assignments!.every(a => a.checked_in)
        const anyLate = hasAssignments && shift.assignments!.some(a => !a.checked_in && !a.late_dismissed)
        const isStarted = now >= start
        const isEnded = now > end

        if (allCheckedIn) return 'completed'
        if (isStarted && anyLate) return 'late'
        if (isEnded) return 'completed' // Or 'ended_incomplete' but user said "turns green and goes to bottom"
        return 'upcoming'
    }

    const filteredShifts = shifts.filter((s) => {
        const start = new Date(s.start_time)
        const dateStr = start.toLocaleDateString()
        const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const searchLower = search.toLowerCase()
        const matchesSearch =
            dateStr.toLowerCase().includes(searchLower) ||
            timeStr.toLowerCase().includes(searchLower) ||
            s.assignments?.some(a => a.volunteer?.name.toLowerCase().includes(searchLower))

        return matchesSearch
    }).sort((a, b) => {
        const statusA = getShiftStatus(a)
        const statusB = getShiftStatus(b)

        // 1. Late & Active (Top)
        if (statusA === 'late' && statusB !== 'late') return -1
        if (statusA !== 'late' && statusB === 'late') return 1

        // 2. Upcoming (Middle) - Chronological
        if (statusA === 'upcoming' && statusB === 'upcoming') {
            return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        }

        // 3. Completed/Dismissed (Bottom)
        if (statusA === 'completed' && statusB !== 'completed') return 1
        if (statusA !== 'completed' && statusB === 'completed') return -1

        // Default chronological
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })

    async function handleCheckIn(assignmentId: string, checked: boolean) {
        await toggleCheckIn(assignmentId, checked)
        router.refresh()
    }

    async function handleDismiss(assignmentId: string) {
        await dismissLateWarning(assignmentId)
        router.refresh()
    }

    async function handleUndismiss(assignmentId: string) {
        await undismissLateWarning(assignmentId)
        router.refresh()
    }

    return (
        <div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search volunteers, dates, or times..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-md dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                />
            </div>

            <div className="space-y-4">
                {filteredShifts.map((shift) => {
                    const status = getShiftStatus(shift)
                    const isLate = status === 'late'
                    const isCompleted = status === 'completed'

                    return (
                        <div
                            key={shift.id}
                            className={`rounded-lg border p-4 shadow-sm transition-all duration-200 ${isLate ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                                isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 opacity-75' :
                                    'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                }`}
                        >
                            <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h3 className={`text-lg font-medium ${isLate ? 'text-red-800 dark:text-red-200' :
                                    isCompleted ? 'text-green-800 dark:text-green-200' :
                                        'text-gray-900 dark:text-white'
                                    }`}>
                                    {shift.name && <span className="font-bold mr-2">{shift.name}:</span>}
                                    {new Date(shift.start_time).toLocaleDateString()} {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </h3>
                                {isLate && (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                        Late / Missing
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                {shift.assignments?.map((assignment) => {
                                    const isAssignmentLate = !assignment.checked_in && !assignment.late_dismissed && new Date() >= new Date(shift.start_time)
                                    const isDismissed = assignment.late_dismissed && !assignment.checked_in

                                    return (
                                        <div key={assignment.id} className="flex items-center justify-between rounded bg-white/50 dark:bg-black/20 p-2">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={assignment.checked_in}
                                                    onChange={(e) => handleCheckIn(assignment.id, e.target.checked)}
                                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className={`font-medium ${assignment.checked_in ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                    {assignment.volunteer?.name || 'Unknown'}
                                                </span>
                                            </div>

                                            {isAssignmentLate && (
                                                <button
                                                    onClick={() => handleDismiss(assignment.id)}
                                                    className="text-xs text-red-600 hover:text-red-800 underline dark:text-red-400"
                                                >
                                                    Dismiss Warning
                                                </button>
                                            )}
                                            {isDismissed && (
                                                <button
                                                    onClick={() => handleUndismiss(assignment.id)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 underline dark:text-gray-400"
                                                >
                                                    Undismiss
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                                {(!shift.assignments || shift.assignments.length === 0) && (
                                    <p className="text-sm italic text-gray-500">No volunteers assigned.</p>
                                )}
                            </div>
                        </div>
                    )
                })}
                {filteredShifts.length === 0 && (
                    <p className="text-center text-gray-500">No shifts found.</p>
                )}
            </div>
        </div>
    )
}
