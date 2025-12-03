'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { addVolunteer, bulkAddVolunteers, deleteVolunteer, deleteAllVolunteers, updateVolunteer } from './actions'
import { useRouter } from 'next/navigation'

type Volunteer = {
    id: string
    name: string
    group: string | null
    max_hours: number | null
}

type Group = {
    id: string
    name: string
    color: string | null
}

const COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#f43f5e', // rose-500
]

const stringToColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % COLORS.length
    return COLORS[index]
}

export default function VolunteerManager({
    eventId,
    initialVolunteers,
    groups,
}: {
    eventId: string
    initialVolunteers: Volunteer[]
    groups: Group[]
}) {
    const [volunteers, setVolunteers] = useState(initialVolunteers)
    const [search, setSearch] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        setVolunteers(initialVolunteers)
    }, [initialVolunteers])

    const filteredVolunteers = volunteers.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.group && v.group.toLowerCase().includes(search.toLowerCase()))
    )

    async function handleAdd(formData: FormData) {
        const res = await addVolunteer(eventId, formData)
        if (res?.error) {
            alert('Error adding volunteer: ' + res.error)
        } else {
            setIsAdding(false)
            router.refresh()
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedVolunteers = results.data.map((row: any) => {
                    // Map columns loosely
                    const name = row['Name'] || row['name'] || row['Volunteer'] || row['volunteer'] || ''
                    const group = row['Group'] || row['group'] || row['Role'] || row['role'] || null
                    const maxHoursRaw = row['Max Hours'] || row['max_hours'] || row['Hours'] || row['hours'] || row['Limit'] || row['limit']

                    const max_hours = maxHoursRaw ? parseFloat(maxHoursRaw) : null

                    if (!name) return null

                    return {
                        name,
                        group,
                        max_hours
                    }
                }).filter(Boolean)

                if (parsedVolunteers.length === 0) {
                    setUploading(false)
                    alert('No valid volunteers found in CSV')
                    return
                }

                const res = await bulkAddVolunteers(eventId, parsedVolunteers)
                setUploading(false)
                if (res?.error) {
                    alert('Error uploading volunteers: ' + res.error)
                } else {
                    alert(`Successfully added ${parsedVolunteers.length} volunteers`)
                    router.refresh()
                }
            },
            error: (error) => {
                setUploading(false)
                alert('Error parsing CSV: ' + error.message)
            },
        })
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure?')) return
        const res = await deleteVolunteer(eventId, id)
        if (res?.error) {
            alert('Error deleting volunteer: ' + res.error)
        } else {
            router.refresh()
        }
    }

    async function handleUpdate(volunteerId: string, formData: FormData) {
        const res = await updateVolunteer(eventId, volunteerId, formData)
        if (res?.error) {
            alert('Error updating volunteer: ' + res.error)
        } else {
            setEditingId(null)
            router.refresh()
        }
    }

    async function handleDeleteAll() {
        if (!confirm('Are you sure you want to delete ALL volunteers? This cannot be undone.')) return
        const res = await deleteAllVolunteers(eventId)
        if (res?.error) {
            alert('Error deleting all volunteers: ' + res.error)
        } else {
            router.refresh()
        }
    }

    // Auto-discover groups from volunteers
    const discoveredGroups = Array.from(new Set(volunteers.map(v => v.group).filter(Boolean))) as string[]

    // Merge with explicit groups (prioritize explicit)
    const allGroupNames = Array.from(new Set([
        ...groups.map(g => g.name),
        ...discoveredGroups
    ])).sort()

    const getGroupColor = (groupName: string | null) => {
        if (!groupName) return '#9ca3af' // gray-400

        // Check explicit groups first
        const explicitGroup = groups.find(g => g.name === groupName)
        if (explicitGroup?.color) return explicitGroup.color

        // Fallback to generated color
        return stringToColor(groupName)
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    placeholder="Search volunteers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-xs dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleDeleteAll}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Delete All
                    </button>
                    <div className="relative group flex items-center">
                        <label className="cursor-pointer rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors duration-200 flex items-center gap-2">
                            {uploading ? 'Uploading...' : 'Import CSV'}
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                        <div className="ml-2 cursor-help text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                                <p className="font-bold mb-1">CSV Format Instructions:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>Name:</strong> Volunteer name (Required)</li>
                                    <li><strong>Group:</strong> Role/Group (e.g., "Delegates")</li>
                                    <li><strong>Max Hours:</strong> Number (e.g., 8.0)</li>
                                </ul>
                                <p className="mt-2 text-gray-400">Columns: Name, Group, Max Hours</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {isAdding ? 'Cancel' : 'Add Volunteer'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <form action={handleAdd} className="grid gap-4 sm:grid-cols-4 items-end">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                            <select
                                name="group"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            >
                                <option value="">-- Select Group --</option>
                                {allGroupNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Hours</label>
                            <input
                                type="number"
                                name="max_hours"
                                step="0.5"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-4 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow transition-colors duration-200">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Group
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Max Hours
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {filteredVolunteers.map((volunteer) => {
                            const isEditing = editingId === volunteer.id
                            return (
                                <tr key={volunteer.id}>
                                    {isEditing ? (
                                        <>
                                            <td colSpan={4} className="px-6 py-4">
                                                <form action={(formData) => handleUpdate(volunteer.id, formData)} className="grid gap-4 sm:grid-cols-4 items-end">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            defaultValue={volunteer.name}
                                                            required
                                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                                                        <select
                                                            name="group"
                                                            defaultValue={volunteer.group || ''}
                                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                        >
                                                            <option value="">-- Select Group --</option>
                                                            {allGroupNames.map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Hours</label>
                                                        <input
                                                            type="number"
                                                            name="max_hours"
                                                            defaultValue={volunteer.max_hours || ''}
                                                            step="0.5"
                                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingId(null)}
                                                            className="rounded-md bg-gray-300 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {volunteer.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {volunteer.group ? (
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                        style={{ backgroundColor: getGroupColor(volunteer.group) }}
                                                    >
                                                        {volunteer.group}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {volunteer.max_hours || 'Unlimited'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => setEditingId(volunteer.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(volunteer.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )
                        })}
                        {filteredVolunteers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No volunteers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
