'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateNextOccurrence } from '../actions'
import { useNotification } from '@/components/ui/NotificationProvider'

export function GenerateNextOccurrenceButton({ eventId }: { eventId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { showAlert } = useNotification()

    async function handleClick() {
        setLoading(true)
        const res = await generateNextOccurrence(eventId)
        setLoading(false)
        if (res?.error) {
            showAlert(res.error, 'error')
        } else if (res?.newEventId) {
            showAlert('Next occurrence created. Opening new event.', 'success')
            router.push(`/events/${res.newEventId}`)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
            {loading ? 'Creating...' : 'Generate next occurrence'}
        </button>
    )
}
