'use client'

import { useState } from 'react'
import { assignVolunteer, unassignVolunteer, autoAssign, swapAssignments } from './actions'
import { useRouter } from 'next/navigation'

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

    const filteredShifts = shifts.filter((s) => {
        const start = new Date(s.start_time).toLocaleString()
        return start.toLowerCase().includes(search.toLowerCase())
    })

    async function handleAutoAssign() {
        setLoading(true)
        const res = await autoAssign(eventId)
        setLoading(false)

        if (res?.error) {
            alert('Error: ' + res.error)
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

            alert(
                `⚠️ Partial Assignment Complete\n\n` +
                `Some shifts were filled, but the following positions remain unfilled:\n\n` +
                `${unfilledDetails}\n\n` +
                `Please add more volunteers or adjust shift requirements.`
            )
            router.refresh()
        } else {
            alert('✅ Auto-assignment complete! All shifts filled successfully.')
            router.refresh()
        }
    }

    async function handleAssign(shiftId: string, volunteerId: string) {
        if (!volunteerId) return
        const res = await assignVolunteer(shiftId, volunteerId)
        if (res?.error) alert(res.error)
        else router.refresh()
    }

    async function handleUnassign(assignmentId: string) {
        if (!confirm('Unassign?')) return
        const res = await unassignVolunteer(assignmentId)
        if (res?.error) alert(res.error)
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
            if (res?.error) alert(res.error)
            else {
                setSelectedAssignment(null)
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
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-xs dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleAutoAssign}
                        disabled={loading}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {loading ? 'Assigning...' : 'Auto Assign'}
                    </button>
                </div>
            </div>

            {selectedAssignment && (
                <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                    Select another assignment to swap with. <button onClick={() => setSelectedAssignment(null)} className="underline">Cancel</button>
                </div>
            )}

            <div className="grid gap-6">
                {filteredShifts.map((shift) => (
                    <div key={shift.id} className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-colors duration-200">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
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
                ))}
            </div>
        </div>
    )
}
