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
        } else {
            alert('Auto-assignment complete!')
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
                    className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-xs"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleAutoAssign}
                        disabled={loading}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Assigning...' : 'Auto Assign'}
                    </button>
                </div>
            </div>

            {selectedAssignment && (
                <div className="mb-4 rounded-md bg-yellow-50 p-4 text-yellow-800">
                    Select another assignment to swap with. <button onClick={() => setSelectedAssignment(null)} className="underline">Cancel</button>
                </div>
            )}

            <div className="grid gap-6">
                {filteredShifts.map((shift) => (
                    <div key={shift.id} className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                                {new Date(shift.start_time).toLocaleString()} - {new Date(shift.end_time).toLocaleTimeString()}
                            </h3>
                            <div className="flex items-center gap-2">
                                <select
                                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
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
                                    className={`flex items-center justify-between rounded-md border p-3 ${selectedAssignment === assignment.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' : 'border-gray-200'
                                        }`}
                                >
                                    <span className="font-medium text-gray-900">
                                        {assignment.volunteer?.name || 'Unknown Volunteer'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSwap(assignment.id)}
                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            {selectedAssignment === assignment.id ? 'Selected' : 'Swap'}
                                        </button>
                                        <button
                                            onClick={() => handleUnassign(assignment.id)}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!shift.assignments || shift.assignments.length === 0) && (
                                <p className="text-sm text-gray-500 italic">No volunteers assigned.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
