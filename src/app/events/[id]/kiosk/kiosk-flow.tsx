'use client'

import { useState, useEffect } from 'react'
import { kioskCheckIn, kioskCheckOut, searchVolunteers } from './actions'
import { Search, CheckCircle, Package, ArrowRight, LogOut, Loader2, Clock, ArrowLeftRight, ArrowLeft } from 'lucide-react'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { useNotification } from '@/components/ui/NotificationProvider'


// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

type Volunteer = {
    id: string
    name: string
    group: string | null
    assignments: {
        id: string
        checked_in: boolean
        checked_out_at: string | null
        shift: {
            id: string
            start_time: string
            end_time: string
            name?: string
        }
    }[]
    active_assets: {
        id: string
        asset: {
            id: string
            name: string
            identifier: string | null
        }
    }[]
}

type Asset = {
    id: string
    name: string
    type: string
    identifier: string | null
    status: string
}

export default function KioskFlow({
    eventId,
    availableAssets,
}: {
    eventId: string
    availableAssets: Asset[]
}) {
    const { showAlert } = useNotification()
    const [step, setStep] = useState<'search' | 'confirm' | 'assets' | 'transfer' | 'success'>('search')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Volunteer[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
    const [targetAssignmentId, setTargetAssignmentId] = useState<string | null>(null)
    const [previousAssignmentId, setPreviousAssignmentId] = useState<string | null>(null)
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null)
    const [transferAssets, setTransferAssets] = useState(false)
    const [message, setMessage] = useState('')

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    useEffect(() => {
        async function performSearch() {
            if (debouncedSearchQuery.length === 0) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const { volunteers } = await searchVolunteers(eventId, debouncedSearchQuery)
                setSearchResults(volunteers as Volunteer[])
            } catch (error) {
                console.error('Search failed', error)
            } finally {
                setIsSearching(false)
            }
        }

        performSearch()
    }, [debouncedSearchQuery, eventId])

    const handleSelectVolunteer = (volunteer: Volunteer) => {
        setSelectedVolunteer(volunteer)
        setStep('confirm')
    }

    const handleShiftAction = (assignmentId: string, type: 'checkin' | 'checkout') => {
        setTargetAssignmentId(assignmentId)
        setActionType(type)

        if (type === 'checkin') {
            const activeAssignment = selectedVolunteer?.assignments.find(a => a.checked_in && !a.checked_out_at && a.id !== assignmentId)

            if (activeAssignment) {
                setPreviousAssignmentId(activeAssignment.id)
                if (selectedVolunteer?.active_assets && selectedVolunteer.active_assets.length > 0) {
                    setStep('transfer')
                } else {
                    setStep('assets')
                }
            } else {
                setStep('assets')
            }
        } else {
            setStep('assets')
        }
    }

    const toggleAssetSelection = (assetId: string) => {
        if (selectedAssets.includes(assetId)) {
            setSelectedAssets(selectedAssets.filter(id => id !== assetId))
        } else {
            setSelectedAssets([...selectedAssets, assetId])
        }
    }

    const completeAction = async () => {
        if (!selectedVolunteer || !actionType || !targetAssignmentId) return

        try {
            if (actionType === 'checkin') {
                await kioskCheckIn(
                    eventId,
                    selectedVolunteer.id,
                    targetAssignmentId,
                    selectedAssets,
                    previousAssignmentId || undefined,
                    transferAssets
                )

                setMessage(`Checked In!`)
            } else {
                const assetIdsToReturn = selectedVolunteer.active_assets.map(aa => aa.asset.id)
                await kioskCheckOut(eventId, selectedVolunteer.id, targetAssignmentId, assetIdsToReturn)
                setMessage(`Checked Out!`)
            }

            setStep('success')
            setTimeout(reset, 3000)
        } catch (error) {
            console.error('Kiosk action failed:', error)
            showAlert('An unexpected error occurred. Please try again.', 'error')
        }
    }

    const reset = () => {
        setStep('search')
        setSearchQuery('')
        setSearchResults([])
        setSelectedVolunteer(null)
        setTargetAssignmentId(null)
        setPreviousAssignmentId(null)
        setSelectedAssets([])
        setActionType(null)
        setTransferAssets(false)
        setMessage('')
    }

    const renderStep = () => {
        if (step === 'success') {
            return (
                <div className="flex h-full flex-col items-center justify-center text-center p-12">
                    <div className="relative mb-8">
                        <CheckCircle className="h-32 w-32 text-green-500 relative z-10" />
                    </div>
                    <h2 className="text-6xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase italic">
                        {message}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xl font-medium">Returning to search in 3 seconds...</p>
                </div>
            )
        }

        if (step === 'transfer') {
            return (
                <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                    <div className="glass-panel p-12 rounded-[3.5rem] max-w-2xl w-full shadow-2xl">
                        <div className="bg-indigo-500/10 p-6 rounded-full w-fit mx-auto mb-8">
                            <ArrowLeftRight className="h-20 w-20 text-indigo-500" />
                        </div>
                        <h2 className="text-5xl font-black text-zinc-900 dark:text-white mb-6 tracking-tight italic uppercase">
                            Switching Shifts
                        </h2>
                        <p className="text-2xl text-zinc-500 dark:text-zinc-400 mb-12 font-medium">
                            You are currently checked in. Would you like to keep your current equipment for the next shift?
                        </p>

                        <div className="grid gap-6 w-full">
                            <PremiumButton
                                onClick={() => { setTransferAssets(true); setStep('assets'); }}
                                className="w-full py-8 text-2xl !rounded-3xl"
                            >
                                <Package className="h-8 w-8 mr-2" />
                                Yes, Keep Equipment
                            </PremiumButton>
                            <PremiumButton
                                variant="secondary"
                                onClick={() => { setTransferAssets(false); setStep('assets'); }}
                                className="w-full py-8 text-2xl !rounded-3xl"
                            >
                                <LogOut className="h-8 w-8 mr-2" />
                                No, Return & Pick New
                            </PremiumButton>
                        </div>
                    </div>
                </div>
            )
        }

        if (step === 'assets') {
            return (
                <div className="flex h-full flex-col p-6">
                    <div className="glass-panel h-full flex flex-col p-10 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="mb-10">
                            <h2 className="text-4xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">
                                {actionType === 'checkin' ? 'Select Equipment' : 'Verify Return'}
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg mt-2 font-medium">
                                {actionType === 'checkin' ? 'Pick the gear you will be using' : 'The following items will be marked as returned'}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {actionType === 'checkin' ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {availableAssets.map(asset => (
                                        <button
                                            key={asset.id}
                                            onClick={() => toggleAssetSelection(asset.id)}
                                            className={`group relative p-8 rounded-3xl border-2 text-left active:scale-[0.98] transition-all duration-200 ${selectedAssets.includes(asset.id)
                                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30'
                                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-2xl ${selectedAssets.includes(asset.id) ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                    <Package className="h-8 w-8" />
                                                </div>
                                                {selectedAssets.includes(asset.id) && (
                                                    <CheckCircle className="h-8 w-8 text-indigo-600" />
                                                )}
                                            </div>
                                            <div className="font-black text-2xl text-zinc-900 dark:text-white uppercase italic">{asset.name}</div>
                                            <div className="text-lg text-zinc-500 dark:text-zinc-400 font-mono mt-1">{asset.identifier}</div>
                                        </button>
                                    ))}
                                    {availableAssets.length === 0 && (
                                        <div className="col-span-full py-12 text-center">
                                            <p className="text-2xl text-zinc-400 font-medium italic">No available equipment to assign.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedVolunteer?.active_assets.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-2xl text-zinc-400 font-medium italic">No equipment currently assigned.</p>
                                        </div>
                                    ) : (
                                        selectedVolunteer?.active_assets.map(aa => (
                                            <div key={aa.id} className="flex items-center justify-between p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-4 rounded-2xl bg-orange-100 dark:bg-orange-900/20 text-orange-600">
                                                        <Package className="h-10 w-10" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-3xl text-zinc-900 dark:text-white uppercase italic">{aa.asset.name}</p>
                                                        <p className="text-xl text-zinc-500 dark:text-zinc-400 font-mono">{aa.asset.identifier}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-orange-600 bg-orange-50 dark:bg-orange-900/10 px-6 py-3 rounded-full border border-orange-200 dark:border-orange-800/50">
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    <span className="font-black uppercase italic text-lg">Returning</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-10 flex gap-6">
                            <PremiumButton
                                variant="secondary"
                                onClick={() => setStep('confirm')}
                                className="px-10 py-6 text-xl !rounded-3xl"
                            >
                                <ArrowLeft className="h-6 w-6 mr-2" />
                                Back
                            </PremiumButton>
                            <PremiumButton
                                onClick={completeAction}
                                className="flex-1 py-6 text-2xl !rounded-3xl"
                            >
                                {actionType === 'checkin' ? 'Complete Check-In' : 'Complete Check-Out'}
                                <ArrowRight className="h-6 w-6 ml-2" />
                            </PremiumButton>
                        </div>
                    </div>
                </div>
            )
        }

        if (step === 'confirm') {
            const sortedAssignments = selectedVolunteer?.assignments.sort((a, b) =>
                new Date(a.shift.start_time).getTime() - new Date(b.shift.start_time).getTime()
            ) || []

            return (
                <div className="flex h-full flex-col p-6">
                    <div className="glass-panel h-full flex flex-col p-10 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="text-center mb-10">
                            <div className="inline-block px-6 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-sm mb-4">
                                Identity Verified
                            </div>
                            <h2 className="text-6xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">{selectedVolunteer?.name}</h2>
                            <p className="text-2xl text-zinc-500 dark:text-zinc-400 font-medium mt-1 uppercase tracking-wider">{selectedVolunteer?.group || 'Volunteer'}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {sortedAssignments.map(assignment => {
                                const isActive = assignment.checked_in && !assignment.checked_out_at
                                const isCompleted = assignment.checked_in && assignment.checked_out_at
                                const startTime = new Date(assignment.shift.start_time)
                                const endTime = new Date(assignment.shift.end_time)

                                return (
                                    <div key={assignment.id} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${isActive
                                        ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 shadow-lg shadow-green-500/10'
                                        : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40'
                                        }`}>
                                        <div className="flex items-center justify-between gap-8">
                                            <div className="flex-1">
                                                <p className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">
                                                    {assignment.shift.name || 'Shift'}
                                                </p>
                                                <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-2 text-xl font-medium">
                                                    <Clock className="h-6 w-6 mr-3 text-indigo-500" />
                                                    {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div>
                                                {isActive ? (
                                                    <PremiumButton
                                                        variant="danger"
                                                        onClick={() => handleShiftAction(assignment.id, 'checkout')}
                                                        className="px-10 py-6 text-xl !rounded-[1.5rem]"
                                                    >
                                                        <LogOut className="h-7 w-7 mr-2" />
                                                        Check Out
                                                    </PremiumButton>
                                                ) : isCompleted ? (
                                                    <div className="flex items-center px-8 py-6 rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-black uppercase italic text-xl border border-zinc-200 dark:border-zinc-700">
                                                        <CheckCircle className="h-7 w-7 mr-3 text-green-500" />
                                                        Completed
                                                    </div>
                                                ) : (
                                                    <PremiumButton
                                                        onClick={() => handleShiftAction(assignment.id, 'checkin')}
                                                        className="px-10 py-6 text-xl !rounded-[1.5rem] bg-green-600 hover:bg-green-700 shadow-green-500/20"
                                                    >
                                                        <CheckCircle className="h-7 w-7 mr-2" />
                                                        Check In
                                                    </PremiumButton>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {sortedAssignments.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-3xl text-zinc-400 font-medium italic">No shifts assigned to this profile.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 text-center">
                            <button
                                onClick={reset}
                                className="px-10 py-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-black uppercase italic tracking-widest text-sm transition-colors"
                            >
                                <ArrowLeft className="inline h-4 w-4 mr-2" />
                                Not you? Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        // Default: Search Step
        return (
            <div className="flex h-full flex-col items-center justify-center p-6">
                <div className="text-center mb-16">
                    <h1 className="text-8xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                        Welcome
                    </h1>
                    <p className="text-2xl text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Please enter your name to begin check-in</p>
                </div>

                <div className="w-full max-w-3xl relative mb-12">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type your name..."
                        className="w-full px-12 py-10 text-5xl font-black rounded-full border-4 border-zinc-200 dark:border-zinc-800 shadow-2xl focus:border-indigo-500 focus:ring-[16px] focus:ring-indigo-500/10 outline-none transition-all dark:bg-zinc-900/80 dark:text-white placeholder-zinc-200 dark:placeholder-zinc-800 uppercase italic tracking-tight"
                        autoFocus
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700">
                        {isSearching ? (
                            <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
                        ) : (
                            <Search className="h-16 w-16" />
                        )}
                    </div>
                </div>

                <div className="w-full max-w-3xl space-y-6">
                    {searchResults.map((volunteer) => (
                        <button
                            key={volunteer.id}
                            onClick={() => handleSelectVolunteer(volunteer)}
                            className="w-full p-8 glass-panel rounded-[2rem] shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group transition-all"
                        >
                            <div className="text-left">
                                <p className="text-4xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">{volunteer.name}</p>
                                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mt-1">{volunteer.group}</p>
                            </div>
                            <div className="bg-indigo-600 p-4 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                                <ArrowRight className="h-10 w-10" />
                            </div>
                        </button>
                    ))}
                    {searchQuery.length > 0 && !isSearching && searchResults.length === 0 && (
                        <p className="text-center text-3xl text-zinc-400 font-medium italic mt-12 py-12">
                            No profiles matching that name...
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full">
            {renderStep()}
        </div>
    )
}
