'use client'

import { removeAdmin } from './actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminActionButton({
    eventId,
    userId,
    isMe
}: {
    eventId: string,
    userId: string,
    isMe: boolean
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleAction = async () => {
        if (isMe) {
            const confirmed = window.confirm("Are you sure you want to leave this event? You will need to be re-invited to regain access.")
            if (!confirmed) return
        } else {
            const confirmed = window.confirm("Are you sure you want to remove this admin?")
            if (!confirmed) return
        }

        setLoading(true)
        try {
            const result = await removeAdmin(eventId, userId)
            if (result && 'error' in result && result.error) {
                alert(result.error)
            } else if (result && 'success' in result && result.success) {
                if (isMe) {
                    router.push('/events')
                    router.refresh()
                } else {
                    router.refresh()
                }
            }
        } catch (error) {
            console.error('Error in admin action:', error)
            alert("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleAction}
            disabled={loading}
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${loading ? 'text-zinc-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'
                }`}
        >
            {loading ? 'Processing...' : (isMe ? 'Leave' : 'Remove')}
        </button>
    )
}
