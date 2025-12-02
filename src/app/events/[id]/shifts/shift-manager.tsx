'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { addShift, bulkAddShifts, deleteShift, deleteAllShifts } from './actions'
import { useRouter } from 'next/navigation'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: any
    allowed_groups: string[] | null
}

export default function ShiftManager({
    eventId,
    initialShifts,
}: {
    eventId: string
    initialShifts: Shift[]
}) {
    const [shifts, setShifts] = useState(initialShifts)
    const [search, setSearch] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setShifts(initialShifts)
    }, [initialShifts])

    const filteredShifts = shifts.filter((s) => {
        const start = new Date(s.start_time).toLocaleString()
        return start.toLowerCase().includes(search.toLowerCase())
    })

    async function handleAdd(formData: FormData) {
        // We need to construct the JSON for groups manually or use a more complex form.
        // For this barebones version, let's just take start/end and maybe simple text for groups.
        // Or we can intercept the form submission.

        // Let's assume the user enters JSON in a text area for now for "barebones" flexibility,
        // or we just support start/end for the single add form to keep it simple.

        const res = await addShift(eventId, formData)
        if (res?.error) {
            alert('Error adding shift: ' + res.error)
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
            complete: async (results) => {
                // Filter out empty rows or rows without a start time
                const validShifts = results.data.filter((s: any) => s.start && s.start.trim() !== '')

                if (validShifts.length === 0) {
                    setUploading(false)
                    alert('No valid shifts found in CSV')
                    return
                }

                const res = await bulkAddShifts(eventId, validShifts)
                setUploading(false)
                if (res?.error) {
                    alert('Error uploading shifts: ' + res.error)
                } else {
                    alert(`Successfully added ${validShifts.length} shifts`)
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
        const res = await deleteShift(eventId, id)
        if (res?.error) {
            alert('Error deleting shift: ' + res.error)
        } else {
            router.refresh()
        }
    }

    async function handleDeleteAll() {
        if (!confirm('Are you sure you want to delete ALL shifts? This cannot be undone.')) return
        const res = await deleteAllShifts(eventId)
        if (res?.error) {
            alert('Error deleting all shifts: ' + res.error)
        } else {
            router.refresh()
        }
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    placeholder="Search shifts (by date)..."
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
                        {isAdding ? 'Cancel' : 'Add Shift'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <form action={handleAdd} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Optional shift name"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                            <input
                                type="datetime-local"
                                name="start"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                            <input
                                type="datetime-local"
                                name="end"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Required Groups (JSON: e.g. {'{"Delegates": 1}'})
                            </label>
                            <input
                                type="text"
                                name="required_groups"
                                placeholder='{"Delegates": 1}'
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allowed Groups (JSON Array: e.g. ["Delegates"])
                            </label>
                            <input
                                type="text"
                                name="allowed_groups"
                                placeholder='["Delegates"]'
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
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
                                Start
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                End
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Requirements
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {filteredShifts.map((shift) => (
                            <tr key={shift.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {shift.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(shift.start_time).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(shift.end_time).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <pre className="text-xs">{JSON.stringify(shift.required_groups, null, 2)}</pre>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(shift.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredShifts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No shifts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
