"use client";

import { createEvent, deleteEvent, getUserInvitations, acceptInvitation, declineInvitation } from './actions'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
    const [user, setUser] = useState<any>(null)
    const [events, setEvents] = useState<any[]>([])
    const [invitations, setInvitations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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
            setInvitations(invites)
            setLoading(false)
        }
        loadData()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6 md:p-12 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
            <div className="mx-auto max-w-5xl">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            Dashboard
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium italic">
                            Manage your volunteer operations
                        </p>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button
                            className="text-sm font-bold text-zinc-400 hover:text-indigo-600 transition-colors"
                        >
                            Sign out
                        </button>
                    </form>
                </header>

                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    <div className="space-y-8">
                        {/* Invitations Section */}
                        {invitations.length > 0 && (
                            <div className="premium-card p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30">
                                <div className="flex items-center gap-2 mb-6 text-indigo-700 dark:text-indigo-400">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                                    <h2 className="text-lg font-bold">Pending Invitations ({invitations.length})</h2>
                                </div>
                                <div className="grid gap-4">
                                    {invitations.map((invite: any) => (
                                        <div key={invite.id} className="flex items-center justify-between glass-panel p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/50">
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                                                    {invite.events?.name || 'Unknown Event'}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                    Invitation from administrator
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <form action={async () => {
                                                    await acceptInvitation(invite.id)
                                                    window.location.reload()
                                                }}>
                                                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:scale-105 active:scale-95 transition-all">
                                                        Accept
                                                    </button>
                                                </form>
                                                <form action={async () => {
                                                    await declineInvitation(invite.id)
                                                    window.location.reload()
                                                }}>
                                                    <button type="submit" className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                                                        Decline
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events Grid */}
                        <div className="grid gap-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 ml-1">Your Events</h2>
                            {events?.map((event) => {
                                const isOwner = event.user_id === user.id
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => router.push(`/events/${event.id}`)}
                                        className="premium-card p-6 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all active:scale-[0.99]"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-2xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                                                >
                                                    {event.name}
                                                </Link>
                                                {!isOwner && (
                                                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-sm font-medium text-zinc-400">
                                                <span>Created {new Date(event.created_at).toLocaleDateString()}</span>
                                                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                                <Link
                                                    href={`/events/${event.id}/share`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:text-indigo-600 transition-colors"
                                                >
                                                    Manage Access
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isOwner ? (
                                                <form action={async (formData) => {
                                                    await deleteEvent(formData)
                                                    window.location.reload()
                                                }} onClick={(e) => e.stopPropagation()}>
                                                    <input type="hidden" name="id" value={event.id} />
                                                    <button
                                                        type="submit"
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:scale-110 active:scale-95 transition-all"
                                                        title="Delete Event"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            ) : (
                                                <span className="text-xs text-zinc-500 italic">Shared</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {events?.length === 0 && (
                                <div className="premium-card p-12 text-center">
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">No events found. Let's create your first coordination hub.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-6">
                        <div className="premium-card p-6">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Create Event</h2>
                            <form action={async (formData) => {
                                await createEvent(formData)
                                window.location.reload()
                            }} className="space-y-4">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Conference 2024..."
                                    required
                                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="w-full button-premium"
                                >
                                    Create Hub
                                </button>
                            </form>
                        </div>

                        <div className="premium-card p-6 !bg-zinc-950 text-white dark:!bg-white dark:!text-zinc-900 overflow-hidden relative border-none">
                            <div className="relative z-10">
                                <h3 className="font-black text-xl mb-2 italic">Pro Tip</h3>
                                <p className="text-sm font-medium opacity-80 leading-relaxed">
                                    Use "Manage Access" to safely invite other coordinators to your events without sharing your login.
                                </p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-indigo-500/20 rounded-full blur-2xl" />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

