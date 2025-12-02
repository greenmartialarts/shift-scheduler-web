'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { addVolunteer, bulkAddVolunteers, deleteVolunteer, deleteAllVolunteers } from './actions'
import { useRouter } from 'next/navigation'

type Volunteer = {
    id: string
    name: string
    group: string | null
    max_hours: number | null
}

export default function VolunteerManager({
    eventId,
    initialVolunteers,
}: {
    eventId: string
    initialVolunteers: Volunteer[]
}) {
    const [volunteers, setVolunteers] = useState(initialVolunteers)
    const [search, setSearch] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

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
            // Optimistic update or router refresh
            router.refresh()
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                // Filter out empty rows or rows without a name
                const validVolunteers = results.data.filter((v: any) => v.name && v.name.trim() !== '')

                if (validVolunteers.length === 0) {
                    setUploading(false)
                    alert('No valid volunteers found in CSV')
                    return
                }

                const res = await bulkAddVolunteers(eventId, validVolunteers)
                setUploading(false)
                if (res?.error) {
                    alert('Error uploading volunteers: ' + res.error)
                } else {
                    alert(`Successfully added ${validVolunteers.length} volunteers`)
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

    async function handleDeleteAll() {
        if (!confirm('Are you sure you want to delete ALL volunteers? This cannot be undone.')) return
        const res = await deleteAllVolunteers(eventId)
        if (res?.error) {
            alert('Error deleting all volunteers: ' + res.error)
        } else {
            router.refresh()
        }
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
                    <label className="cursor-pointer rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                        {uploading ? 'Uploading...' : 'Import CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
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
                            <input
                                type="text"
                                name="group"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
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
                        {filteredVolunteers.map((volunteer) => (
                            <tr key={volunteer.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {volunteer.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {volunteer.group || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {volunteer.max_hours || 'Unlimited'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(volunteer.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
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
