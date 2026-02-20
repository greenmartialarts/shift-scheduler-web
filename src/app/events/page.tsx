"use client";

import { createEvent, deleteEvent, getUserInvitations, acceptInvitation, declineInvitation } from './actions'
import Link from 'next/link'
import { Calendar, ChevronRight, Users, Plus, Settings, LogOut, Activity, BarChart3, X, LayoutDashboard, UserCircle, Trash2, Lock } from 'lucide-react'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useLogger } from '@/lib/axiom/client';
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { type User } from '@supabase/supabase-js'
import { useTutorial } from '@/components/tutorial/TutorialContext'
import { useNotification } from '@/components/ui/NotificationProvider'
import { getDashboardStats } from '@/lib/dashboard-actions'

interface Event {
    id: string
    name: string
    user_id: string
    created_at: string
    date?: string | null
    stats?: {
        totalVolunteersCount: number
        fillRate: number
    }
}

interface Invitation {
    id: string
    event_id: string
    events?: {
        name: string
    }
}

function CreateEventModal({ isOpen, onClose, onSubmit, actionLoading }: {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
    actionLoading: boolean
}) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Create New Event</h2>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Event Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Summer Gala 2026..."
                                    required
                                    autoFocus
                                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Creating Hub...' : 'Create Coordination Hub'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

function UserDropdown({ user }: { user: User }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U'

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-inner">
                    <span className="text-white text-xs font-bold">{initials}</span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                            <Link href="/account" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group">
                                <Settings className="w-4 h-4 text-zinc-400 group-hover:text-blue-500" />
                                <span>Account Settings</span>
                            </Link>
                        </div>
                        <div className="p-1 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                            <form action="/auth/signout" method="post">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group">
                                    <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                                    <span>Sign out</span>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function EventCard({ event, isOwner, actionLoading, onDelete, onClick }: {
    event: Event,
    isOwner: boolean,
    actionLoading: boolean,
    onDelete: () => void,
    onClick: () => void,
}) {
    const totalVolunteers = event.stats?.totalVolunteersCount ?? 0
    const completionPercent = Math.round(event.stats?.fillRate ?? 0)

    const router = useRouter()

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className="relative group cursor-pointer bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl hover:border-blue-500/50"
        >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {event.name}
                            </h3>
                            {!isOwner && (
                                <span className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                    <Lock className="w-2.5 h-2.5" /> Admin
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Created {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(event.created_at))}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-zinc-100/50 dark:border-zinc-800/50 mb-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Volunteers</p>
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-bold">{totalVolunteers}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</p>
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span className="font-bold">Active</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progress</p>
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                            <BarChart3 className="w-4 h-4 text-purple-500" />
                            <span className="font-bold">{completionPercent}%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/events/${event.id}/share`)
                        }}
                        className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                        Manage Access <ChevronRight className="w-3 h-3" />
                    </button>
                    {isOwner && (
                        <button
                            disabled={actionLoading}
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete()
                            }}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default function EventsPage() {
    const log = useLogger();

    useEffect(() => {
        log.info('Events dashboard visited');
    }, [log]);

    const [user, setUser] = useState<User | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [dateFrom, setDateFrom] = useState<string>('')
    const [dateTo, setDateTo] = useState<string>('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const router = useRouter()
    const { setTutorialEventId, currentStepId, knownEventIds, setKnownEventIds, goToStep, isActive } = useTutorial()
    const { showConfirm } = useNotification()

    // 1. Snapshot Logic: Capture initial state
    useEffect(() => {
        if (!isActive || loading) return
        if (currentStepId === 'create-hub' && events.length > 0) {
            const currentIds = events.map(e => e.id)
            const isSame = knownEventIds.length === currentIds.length && knownEventIds.every(id => currentIds.includes(id))
            if (!isSame) {
                setKnownEventIds(currentIds)
            }
        }
    }, [isActive, currentStepId, events, loading, knownEventIds, setKnownEventIds])

    // 2. Detection Logic: Compare new list
    useEffect(() => {
        if (!isActive || loading) return

        if (knownEventIds.length > 0) {
            const newEvents = events.filter(e => !knownEventIds.includes(e.id))
            if (newEvents.length > 0) {
                const newest = newEvents[0]

                if (currentStepId === 'create-hub' || currentStepId === 'event-details') {
                    setTutorialEventId(newest.id)
                    goToStep('command-center')
                    router.push(`/events/${newest.id}`)
                }
            }
        }
    }, [isActive, events, knownEventIds, loading, currentStepId, setTutorialEventId, goToStep, router])

    const loadData = useCallback(async () => {
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

        if (eventsData) {
            const eventsWithStats = await Promise.all(
                eventsData.map(async (event) => {
                    try {
                        const stats = await getDashboardStats(event.id)
                        return { ...event, stats }
                    } catch (err) {
                        console.error(`Error fetching stats for event ${event.id}:`, err)
                        return { ...event, stats: { totalVolunteersCount: 0, fillRate: 0 } }
                    }
                })
            )
            setEvents(eventsWithStats)
        } else {
            setEvents([])
        }

        const invites = await getUserInvitations()
        setInvitations(invites as Invitation[])
        setLoading(false)
    }, [router])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 17) return "Good afternoon"
        return "Good evening"
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-4">
                            <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                            <div className="h-6 w-96 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                        </div>
                        <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse border border-zinc-200 dark:border-zinc-800" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const filteredEvents = events.filter((e) => {
        if (!dateFrom && !dateTo) return true
        const d = e.date ? new Date(e.date).getTime() : null
        if (d == null) return true
        if (dateFrom && d < new Date(dateFrom).getTime()) return false
        if (dateTo && d > new Date(dateTo + 'T23:59:59').getTime()) return false
        return true
    })

    if (!user) return null

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <div className="mx-auto max-w-7xl">
                {/* Navbar / Header Area */}
                <div className="flex flex-col gap-10">
                    <header className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                                <span>Home</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-blue-600 dark:text-blue-500">Dashboard</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                                {getGreeting()}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                                Manage your volunteer operations and coordination hubs
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <UserDropdown user={user} />
                        </div>
                    </header>

                    <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
                        <div className="space-y-12">
                            {/* Invitations Section */}
                            {invitations.length > 0 && (
                                <div className="p-1 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 shadow-xl shadow-blue-500/5">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                                                <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
                                                <h2 className="text-xl font-black">Pending Invitations ({invitations.length})</h2>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {invitations.map((invite) => (
                                                <div key={invite.id} className="flex items-center justify-between bg-white/80 dark:bg-zinc-950/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div>
                                                        <p className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                                                            {invite.events?.name || 'Unknown Event'}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                                                            Admin Invitation
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            disabled={!!actionLoading}
                                                            onClick={async () => {
                                                                setActionLoading(`accept-${invite.id}`)
                                                                try {
                                                                    await acceptInvitation(invite.id)
                                                                    await loadData()
                                                                } finally {
                                                                    setActionLoading(null)
                                                                }
                                                            }}
                                                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            disabled={!!actionLoading}
                                                            onClick={async () => {
                                                                setActionLoading(`decline-${invite.id}`)
                                                                try {
                                                                    await declineInvitation(invite.id)
                                                                    await loadData()
                                                                } finally {
                                                                    setActionLoading(null)
                                                                }
                                                            }}
                                                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Events Grid Area */}
                            <div>
                                <div className="flex items-center justify-between mb-8 px-1">
                                    <div className="flex items-center gap-6">
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                                            Your Coordination Hubs
                                        </h2>
                                        {/* Styled Date Pickers */}
                                        <div className="hidden lg:flex items-center gap-4 p-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="bg-transparent text-[11px] font-bold text-zinc-600 dark:text-zinc-300 outline-none w-28 uppercase tracking-tighter"
                                                />
                                                <span className="text-zinc-400">→</span>
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="bg-transparent text-[11px] font-bold text-zinc-600 dark:text-zinc-300 outline-none w-28 uppercase tracking-tighter"
                                                />
                                            </div>
                                            {(dateFrom || dateTo) && (
                                                <button
                                                    onClick={() => { setDateFrom(''); setDateTo('') }}
                                                    className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5 text-zinc-500" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl font-black text-sm hover:scale-[1.05] active:scale-[0.98] transition-all shadow-lg"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Create Hub</span>
                                    </button>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredEvents.map((event) => {
                                            const isOwner = event.user_id === user.id
                                            return (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    isOwner={isOwner}
                                                    actionLoading={actionLoading === `delete-${event.id}`}
                                                    onClick={() => router.push(`/events/${event.id}`)}
                                                    onDelete={async () => {
                                                        const confirmed = await showConfirm({
                                                            title: 'Delete Event',
                                                            message: `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
                                                            confirmText: 'Delete Event',
                                                            type: 'danger'
                                                        })
                                                        if (!confirmed) return

                                                        setActionLoading(`delete-${event.id}`)
                                                        try {
                                                            const formData = new FormData()
                                                            formData.append('id', event.id)
                                                            await deleteEvent(formData)
                                                            await loadData()
                                                        } finally {
                                                            setActionLoading(null)
                                                        }
                                                    }}
                                                />
                                            )
                                        })}
                                    </div>
                                </AnimatePresence>

                                {filteredEvents?.length === 0 && (
                                    <div className="p-20 text-center bg-white/30 dark:bg-zinc-900/10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                        <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                                            <LayoutDashboard className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">No events found in this date range.</p>
                                        <button
                                            onClick={() => { setDateFrom(''); setDateTo('') }}
                                            className="mt-4 text-blue-600 font-bold hover:underline"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Redesigned Sidebar */}
                        <aside className="space-y-6 lg:sticky lg:top-8">
                            <div className="p-8 bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-24 h-24 text-blue-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1 px-2.5 bg-blue-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                                            PRO TIP
                                        </div>
                                    </div>
                                    <h3 className="font-extrabold text-xl mb-3 text-white">Smart Coordination</h3>
                                    <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                                        Use &quot;Manage Access&quot; to safely invite other coordinators to your events without sharing your master credentials.
                                    </p>
                                    <div className="mt-8 pt-8 border-t border-zinc-800">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                                                    <UserCircle className="w-5 h-5 text-zinc-600" />
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                +12
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                actionLoading={actionLoading === 'create-event'}
                onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    setActionLoading('create-event')
                    try {
                        const formData = new FormData(form)
                        await createEvent(formData)
                        await loadData()
                        form.reset()
                        setIsCreateModalOpen(false)
                    } finally {
                        setActionLoading(null)
                    }
                }}
            />
        </div>
    )
}

import { Sparkles } from 'lucide-react'

