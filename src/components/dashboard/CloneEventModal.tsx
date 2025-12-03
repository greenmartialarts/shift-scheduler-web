'use client'

import { useState } from 'react'
import { cloneEvent } from '@/app/events/[id]/actions'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'

export function CloneEventModal({ eventId, eventName, eventDate }: { eventId: string, eventName: string, eventDate: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCloning, setIsCloning] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsCloning(true)
        const res = await cloneEvent(eventId, formData)
        setIsCloning(false)

        if (res?.error) {
            alert('Error cloning event: ' + res.error)
        } else if (res?.newEventId) {
            setIsOpen(false)
            router.push(`/events/${res.newEventId}`)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors duration-200"
            >
                <Copy className="h-4 w-4" />
                Clone Event
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Clone Event</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Event Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={`Copy of ${eventName}`}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Event Date</label>
                        <input
                            type="date"
                            name="date"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="copyVolunteers"
                                id="copyVolunteers"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="copyVolunteers" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Copy Volunteers
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="copyShifts"
                                id="copyShifts"
                                defaultChecked
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="copyShifts" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Copy Shifts
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Shift Time Offset (Days)
                        </label>
                        <input
                            type="number"
                            name="offsetDays"
                            defaultValue="0"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Add this many days to shift start/end times.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCloning}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                        >
                            {isCloning ? 'Cloning...' : 'Clone Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
