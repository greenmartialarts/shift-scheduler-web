"use client";

import { createEvent, deleteEvent, getUserInvitations, acceptInvitation, declineInvitation } from './actions'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { type User } from '@supabase/supabase-js'
import { Settings } from 'lucide-react'
import { useTutorial } from '@/components/tutorial/TutorialContext'


interface Event {
    id: string
    name: string
    user_id: string
    created_at: string
}

interface Invitation {
    id: string
    event_id: string
    events?: {
        name: string
    }
}

export default function EventsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const router = useRouter()
    const { setTutorialEventId, currentStepId, knownEventIds, setKnownEventIds, goToStep, isActive } = useTutorial()

    // 1. Snapshot Logic: Capture initial state
    useEffect(() => {
        if (!isActive || loading) return
        if (currentStepId === 'create-hub' && events.length > 0) {
            // Only snapshot if we haven't already (or if list changed meaningfully, but stick to simple first)
            // Actually, we want to ensure we have the 'before' list.
            const currentIds = events.map(e => e.id)
            // Simple check: if knownEventIds is empty, fill it.
            // OR if we are explicitly in create-hub, update it.
            // Let's rely on: if knownEventIds is DIFFERENT from current, and we haven't created one yet...
            // Simplest: Always keep knownEventIds up to date UNTIL we are about to create.
            // BUT user wants: "take a snapshot... when new event made compare".
            // So: snapshot on 'create-hub'.

            // Check if we need to update snapshot
            const isSame = knownEventIds.length === currentIds.length && knownEventIds.every(id => currentIds.includes(id))
            if (!isSame) {
                setKnownEventIds(currentIds)
            }
        }
    }, [isActive, currentStepId, events, loading, knownEventIds, setKnownEventIds])

    // 2. Detection Logic: Compare new list
    useEffect(() => {
        if (!isActive || loading) return

        // If we have known IDs (snapshot taken)
        // And we see a new event that wasn't in known IDs
        if (knownEventIds.length > 0) {
            const newEvents = events.filter(e => !knownEventIds.includes(e.id))
            if (newEvents.length > 0) {
                // Found a new event!
                const newest = newEvents[0] // take the first found

                // If we are in create-hub or event-details (just in case)
                if (currentStepId === 'create-hub' || currentStepId === 'event-details') {
                    setTutorialEventId(newest.id)
                    // Auto-navigate as requested
                    // We skip 'open-event' manual step since we auto-nav
                    goToStep('command-center')
                    router.push(`/events/${newest.id}`)
                }
            }
        }
    }, [isActive, events, knownEventIds, loading, currentStepId, setTutorialEventId, goToStep, router])

    useEffect(() => {
        async function loadData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUser(user)
            const { data: eventsData } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false })
            setEvents(eventsData || [])

            const invites = await getUserInvitations()
            setInvitations(invites as Invitation[])
            setLoading(false)
        }
        loadData()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 p-4 md:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mb-8" />
                    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-4 md:p-8 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Dashboard
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                            Manage your volunteer operations
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {user?.email && (
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {user.email}
                            </span>
                        )}
                        <Link
                            href="/account"
                            className="text-zinc-400 hover:text-blue-600 transition-colors"
                            title="Account Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        <form action="/auth/signout" method="post">
                            <button
                                className="text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors"
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </header>

                <div className="grid lg:grid-cols-[1fr_300px] gap-6">
                    <div className="space-y-6">
                        {/* Invitations Section */}
                        {invitations.length > 0 && (
                            <div className="premium-card p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30">
                                <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                    <h2 className="text-lg font-bold">Pending Invitations ({invitations.length})</h2>
                                </div>
                                <div className="grid gap-3">
                                    {invitations.map((invite) => (
                                        <div key={invite.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                                                    {invite.events?.name || 'Unknown Event'}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                    Invitation from administrator
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={!!actionLoading}
                                                    onClick={async () => {
                                                        setActionLoading(`accept-${invite.id}`)
                                                        await acceptInvitation(invite.id)
                                                        router.refresh()
                                                        setActionLoading(null)
                                                    }}
                                                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === `accept-${invite.id}` ? '...' : 'Accept'}
                                                </button>
                                                <button
                                                    disabled={!!actionLoading}
                                                    onClick={async () => {
                                                        setActionLoading(`decline-${invite.id}`)
                                                        await declineInvitation(invite.id)
                                                        router.refresh()
                                                        setActionLoading(null)
                                                    }}
                                                    className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === `decline-${invite.id}` ? '...' : 'Decline'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events Grid */}
                        <div className="grid gap-3">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 ml-1">Your Events</h2>
                            <AnimatePresence mode="popLayout">
                                {events?.map((event, index) => {
                                    const isOwner = event.user_id === user.id
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={event.id}
                                            id={index === 0 ? "latest-event-card" : undefined}
                                            onClick={() => router.push(`/events/${event.id}`)}
                                            className="premium-card p-5 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-md"
                                        >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                                >
                                                    {event.name}
                                                </Link>
                                                {!isOwner && (
                                                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex items-center gap-3 text-sm font-medium text-zinc-500">
                                                <span>Created {new Date(event.created_at).toLocaleDateString()}</span>
                                                <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                <Link
                                                    href={`/events/${event.id}/share`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    Manage Access
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isOwner ? (
                                                <button
                                                    id={index === 0 ? "delete-event-btn" : undefined}
                                                    disabled={actionLoading === `delete-${event.id}`}
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        setActionLoading(`delete-${event.id}`)
                                                        const formData = new FormData()
                                                        formData.append('id', event.id)
                                                        await deleteEvent(formData)
                                                        router.refresh()
                                                        setActionLoading(null)
                                                    }}
                                                    className="h-9 w-9 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                                                    title="Delete Event"
                                                >
                                                    {actionLoading === `delete-${event.id}` ? (
                                                        <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-zinc-500 italic">Shared</span>
                                            )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                            {events?.length === 0 && (
                                <div className="premium-card p-12 text-center border-dashed">
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">No events found. Let&apos;s create your first coordination hub.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-6">
                        <div id="event-form" className="premium-card p-5">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">Create Event</h2>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    setActionLoading('create-event')
                                    const formData = new FormData(e.currentTarget)
                                    await createEvent(formData)
                                    router.refresh()
                                    // Reset form
                                    const form = e.currentTarget as HTMLFormElement
                                    form.reset()
                                    setActionLoading(null)
                                }}
                                className="space-y-3"
                            >
                                <input
                                    type="hidden"
                                    name="timezone"
                                    value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                                />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Conference 2024..."
                                    required
                                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-400"
                                />
                                <button
                                    id="create-event-button"
                                    type="submit"
                                    disabled={actionLoading === 'create-event'}
                                    className="w-full button-premium text-sm disabled:opacity-70"
                                >
                                    {actionLoading === 'create-event' ? 'Creating...' : 'Create Hub'}
                                </button>
                            </form>
                        </div>

                        <div className="premium-card p-5 !bg-zinc-900 text-white dark:!bg-white dark:!text-zinc-900 overflow-hidden relative border-none">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                                <p className="text-sm font-medium opacity-90 leading-relaxed">
                                    Use &quot;Manage Access&quot; to safely invite other coordinators to your events without sharing your login.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

