'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Activity, Box, LogIn, LogOut, Users } from 'lucide-react'
import { checkInVolunteer, checkOutVolunteer, assignAsset, returnAsset, logActivity } from './actions'
import { useNotification } from '@/components/ui/NotificationProvider'
import { GroupBadge } from '@/components/ui/GroupBadge'

// Define types for better clarity and type safety
export interface Volunteer {
    id: string
    name: string
    group: string
}

export interface Shift {
    id: string
    name: string | null
    start_time: string
    end_time: string
}

export interface Assignment {
    id: string
    volunteer: Volunteer
    shift: Shift
    checked_in: boolean
    checked_in_at: string | null
    checked_out_at: string | null
}

export interface Asset {
    id: string
    name: string
    status: 'available' | 'assigned'
    volunteer_id: string | null
    volunteer: Volunteer | null
}

export interface ActivityLog {
    id: string
    created_at: string
    type: 'check_in' | 'check_out' | 'asset_out' | 'asset_in' | 'late_warning'
    description: string
    volunteer_id: string | null
    metadata: Record<string, unknown> | null
}

export interface ActivePersonnelManagerProps {
    eventId: string
    eventName: string
    initialAssignments: Assignment[]
    initialAssets: Asset[]
    initialLogs: ActivityLog[]
}

export default function ActivePersonnelManager({
    eventId,
    eventName,
    initialAssignments,
    initialAssets,
    initialLogs
}: ActivePersonnelManagerProps) {
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
    const [assets, setAssets] = useState<Asset[]>(initialAssets)
    const [logs, setLogs] = useState<ActivityLog[]>(initialLogs)
    const [activeTab, setActiveTab] = useState<'checkin' | 'checkout' | 'assets'>('checkin')
    const [searchTerm, setSearchTerm] = useState<string>('')

    const supabase = createClient()
    const router = useRouter()
    const { showAlert } = useNotification()

    // Sync state only if props actually change (standard way to handle "initial" props that should update state)
    useEffect(() => {
        setAssignments(initialAssignments)
    }, [initialAssignments])

    useEffect(() => {
        setAssets(initialAssets)
    }, [initialAssets])

    useEffect(() => {
        setLogs(initialLogs)
    }, [initialLogs])

    useEffect(() => {
        const channel = supabase
            .channel('dashboard-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => {
                router.refresh()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => {
                router.refresh()
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
                setLogs(prev => [payload.new as ActivityLog, ...prev].slice(0, 50))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    // Missed Shift Detection Logic
    useEffect(() => {
        const checkMissedShifts = async () => {
            const now = new Date()

            assignments.forEach(async (a) => {
                // If not checked in
                if (!a.checked_in_at) {
                    const start = new Date(a.shift.start_time)
                    const diffMinutes = (now.getTime() - start.getTime()) / 1000 / 60

                    // If 5 minutes late (and less than 6 minutes to avoid repeat spam in this rudimentary logic, 
                    // though real logic should use a 'warning_sent' flag in DB or local state)
                    if (diffMinutes > 5 && diffMinutes < 6) {

                        // Check for leeway: did they have a shift ending recently?
                        // We need to look at other assignments for this volunteer
                        const previousShift = assignments.find(prev =>
                            prev.volunteer.id === a.volunteer.id &&
                            prev.id !== a.id &&
                            new Date(prev.shift.end_time).getTime() <= start.getTime() &&
                            (start.getTime() - new Date(prev.shift.end_time).getTime()) / 1000 / 60 <= 15 // 15 min gap allowed
                        )

                        if (!previousShift) {
                            // No previous shift found nearby -> Mark as late
                            await logActivity(eventId, 'late_warning', `Late Warning: ${a.volunteer.name} is over 5 minutes late for ${a.shift.name || 'shift'}.`, a.volunteer.id)
                        }
                    }
                }
            })
        }

        const interval = setInterval(checkMissedShifts, 60000) // Check every minute
        return () => clearInterval(interval)
    }, [assignments, eventId])


    // Helpers
    const handleCheckIn = async (id: string, name: string) => {
        const res = await checkInVolunteer(id, eventId, name)
        if (res?.error) showAlert(res.error, 'error')
        else router.refresh()
    }

    const handleCheckOut = async (id: string, name: string) => {
        const res = await checkOutVolunteer(id, eventId, name)
        if (res?.error) showAlert(res.error, 'error')
        else router.refresh()
    }

    const handleAssetAction = async (asset: Asset) => {
        if (asset.status === 'assigned') {
            // Return
            const res = await returnAsset(asset.id, eventId, asset.name)
            if (res?.error) showAlert(res.error, 'error')
            else router.refresh()
        } else {
            // Assign
            // Simple prompt for now, or could be a modal
            // Ideally we select a volunteer. 
            // For now, let's just claim it for the "First Available" person or ask user?
            // "Assign Asset" usually implies selecting a person. 
            // I'll assume we want to assign to a specific volunteer on the shift list?
            // Or maybe a simple prompt for volunteer ID is too raw.
            // Let's create a quick select modal or alert.
            // Since I can't easily add a complex modal in this single file edit without bloating, 
            // I'll make it so you click a volunteer "Assign Asset" button in the Personnel list
            // OR we just use a simple prompt (browser prompt is ugly but functional for "admin view").

            // Better: Show a list of active volunteers to assign to? 
            // Let's just focus on functionality: 
            // I'll add an "Assign to..." button on the asset that opens a mini-selector if I had one.
            // Allow checking out to a volunteer by ID for now or implement a quick select.

            showAlert("Please select a volunteer from the 'Active Personnel' list to assign this asset.", 'info')
        }
    }


    // ... Simplified Asset assignment:
    // Dropdown in Asset list to pick volunteer?
    // Or Dropdown in Volunteer list to pick Asset?
    // Let's go with: Asset List has a "Check Out" button -> shows a volunteer selector modal (I'll build inline)

    const [checkoutAssetId, setCheckoutAssetId] = useState<string | null>(null)

    const confirmCheckout = async (volunteerId: string, volunteerName: string) => {
        if (!checkoutAssetId) return
        const asset = assets.find(a => a.id === checkoutAssetId)
        if (!asset) return

        const res = await assignAsset(asset.id, volunteerId, eventId, asset.name, volunteerName)
        if (res?.error) {
            showAlert(res.error, 'error')
            setCheckoutAssetId(null)
        } else {
            router.refresh()
            setCheckoutAssetId(null)
        }
    }


    const filteredAssignments = assignments.filter(a =>
        a.volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.shift.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const activePeopleCount = assignments.filter(a => a.checked_in && !a.checked_out_at).length
    const assetsOutCount = assets.filter(a => a.status === 'assigned').length

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* LEFT COLUMN: ACTIVITY STREAM */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Activity Stream - {eventName}
                    </h2>
                    <span className="text-xs font-mono text-zinc-400">{logs.length} events</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="mt-1">
                                {log.type === 'check_in' && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />}
                                {log.type === 'check_out' && <div className="w-2 h-2 rounded-full bg-zinc-300 mt-1.5" />}
                                {log.type === 'asset_out' && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                                {log.type === 'asset_in' && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />}
                                {log.type === 'late_warning' && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse" />}
                            </div>
                            <div>
                                <p className={`font-medium ${log.type === 'late_warning' ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    {log.description}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                    {new Date(log.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && <p className="text-center text-zinc-400 text-sm py-10">No activity recorded yet.</p>}
                </div>
            </div>

            {/* RIGHT COLUMN: MANAGEMENT */}
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Active Personnel</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{activePeopleCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Assets Checked Out</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{assetsOutCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Box className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Main Tabs Panel */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex gap-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('checkin')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'checkin' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Check In
                        </button>
                        <button
                            onClick={() => setActiveTab('checkout')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'checkout' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Check Out
                        </button>
                        <button
                            onClick={() => setActiveTab('assets')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'assets' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Asset Tracking
                        </button>
                    </div>

                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <input
                            type="text"
                            placeholder="Search name, shift..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {(activeTab === 'checkin' || activeTab === 'checkout') && (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-900 sticky top-0 md:static">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-black uppercase text-zinc-400">Name</th>
                                        <th className="px-6 py-3 text-xs font-black uppercase text-zinc-400">Shift</th>
                                        <th className="px-6 py-3 text-xs font-black uppercase text-zinc-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {filteredAssignments
                                        .filter(a => {
                                            if (activeTab === 'checkin') return !a.checked_in && !a.checked_out_at
                                            if (activeTab === 'checkout') return a.checked_in && !a.checked_out_at
                                            return true
                                        })
                                        .length > 0 ? filteredAssignments
                                            .filter(a => {
                                                if (activeTab === 'checkin') return !a.checked_in && !a.checked_out_at
                                                if (activeTab === 'checkout') return a.checked_in && !a.checked_out_at
                                                return true
                                            })
                                            .map(a => {
                                                return (
                                                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${a.checked_in ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`} />
                                                                <div>
                                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{a.volunteer.name}</p>
                                                                    <div className="mt-1"><GroupBadge name={a.volunteer.group} /></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{a.shift.name || 'Standard Shift'}</p>
                                                            <p className="text-xs text-zinc-400 font-mono mt-0.5">
                                                                {new Date(a.shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(a.shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {checkoutAssetId ? (
                                                                <button
                                                                    onClick={() => confirmCheckout(a.volunteer.id, a.volunteer.name)}
                                                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-indigo-700 animate-pulse"
                                                                >
                                                                    Assign Asset To
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    {activeTab === 'checkin' && (
                                                                        <button
                                                                            onClick={() => handleCheckIn(a.id, a.volunteer.name)}
                                                                            className="px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors"
                                                                        >
                                                                            <LogIn className="w-3 h-3 inline mr-1" />
                                                                            Check In
                                                                        </button>
                                                                    )}
                                                                    {activeTab === 'checkout' && (
                                                                        <button
                                                                            onClick={() => handleCheckOut(a.id, a.volunteer.name)}
                                                                            className="px-3 py-1.5 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 transition-colors"
                                                                        >
                                                                            <LogOut className="w-3 h-3 inline mr-1" />
                                                                            Check Out
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            }) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 italic">No personnel found matched criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'assets' && (
                            <div className="p-4">
                                {checkoutAssetId && (
                                    <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl flex items-center justify-between">
                                        <p className="text-sm text-indigo-800 dark:text-indigo-200 font-bold">
                                            Select a volunteer from the &quot;Check In&quot; or &quot;Check Out&quot; tab to assign this asset.
                                        </p>
                                        <button onClick={() => setCheckoutAssetId(null)} className="text-xs underline text-indigo-600">Cancel</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assets.map(asset => (
                                        <div key={asset.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between group hover:border-indigo-200 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{asset.name}</h3>
                                                    <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${asset.status === 'assigned' ? 'text-blue-500' : 'text-green-500'}`}>
                                                        {asset.status === 'assigned' ? 'Checked Out' : 'Available'}
                                                    </p>
                                                </div>
                                                <Box className={`w-5 h-5 ${asset.status === 'assigned' ? 'text-blue-400' : 'text-green-400 opacity-50'}`} />
                                            </div>

                                            {asset.status === 'assigned' ? (
                                                <div className="mt-4">
                                                    <p className="text-xs text-zinc-500 mb-1">Held by:</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{asset.volunteer?.name || 'Unknown'}</span>
                                                        <button
                                                            onClick={() => handleAssetAction(asset)}
                                                            className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm px-3 py-1.5 rounded-lg hover:bg-zinc-50 font-bold"
                                                        >
                                                            Return
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setCheckoutAssetId(asset.id)
                                                        setActiveTab('checkout') // Default to checkout tab for assignment
                                                        showAlert('Select a volunteer to assign this asset to.', 'info')
                                                    }}
                                                    className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/10"
                                                >
                                                    Check Out
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {assets.length === 0 && (
                                        <div className="col-span-2 py-12 text-center text-zinc-400">
                                            <p>No assets configured for this event.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
