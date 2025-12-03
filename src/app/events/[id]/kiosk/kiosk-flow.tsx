'use client'

import { useState, useEffect } from 'react'
import { kioskCheckIn, kioskCheckOut, searchVolunteers } from './actions'
import { Search, CheckCircle, XCircle, Package, ArrowRight, LogOut, Loader2, Clock, ArrowLeftRight } from 'lucide-react'

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
            // Check if there is another active assignment
            const activeAssignment = selectedVolunteer?.assignments.find(a => a.checked_in && !a.checked_out_at && a.id !== assignmentId)

            if (activeAssignment) {
                setPreviousAssignmentId(activeAssignment.id)
                // If they have assets, ask about transfer
                if (selectedVolunteer?.active_assets && selectedVolunteer.active_assets.length > 0) {
                    setStep('transfer')
                } else {
                    // No assets to transfer, just auto-checkout
                    setStep('assets') // Go to assets selection for NEW shift
                }
            } else {
                setStep('assets')
            }
        } else {
            // Checkout
            setStep('assets') // Confirm return of assets
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

    // RENDER STEPS

    if (step === 'success') {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle className="h-24 w-24 text-green-500 mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{message}</h2>
            </div>
        )
    }

    if (step === 'transfer') {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <ArrowLeftRight className="h-24 w-24 text-indigo-500 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Switching Shifts</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                    You are currently checked in to another shift. Do you want to keep your current equipment?
                </p>

                <div className="grid gap-4 w-full max-w-md">
                    <button
                        onClick={() => { setTransferAssets(true); setStep('assets'); }}
                        className="p-6 rounded-xl bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                        Yes, Keep Equipment
                    </button>
                    <button
                        onClick={() => { setTransferAssets(false); setStep('assets'); }}
                        className="p-6 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                        No, Return & Pick New
                    </button>
                </div>
            </div>
        )
    }

    if (step === 'assets') {
        return (
            <div className="flex h-full flex-col p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {actionType === 'checkin' ? 'Assign New Equipment?' : 'Return Equipment'}
                </h2>

                <div className="flex-1 overflow-y-auto">
                    {actionType === 'checkin' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {availableAssets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => toggleAssetSelection(asset.id)}
                                    className={`p-6 rounded-xl border-2 text-left transition-all ${selectedAssets.includes(asset.id)
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="font-bold text-lg text-gray-900 dark:text-white">{asset.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{asset.identifier}</div>
                                    {selectedAssets.includes(asset.id) && (
                                        <CheckCircle className="mt-2 h-6 w-6 text-indigo-600" />
                                    )}
                                </button>
                            ))}
                            {availableAssets.length === 0 && (
                                <p className="col-span-full text-gray-500">No available assets to assign.</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedVolunteer?.active_assets.length === 0 ? (
                                <p className="text-xl text-gray-500">No assets to return.</p>
                            ) : (
                                selectedVolunteer?.active_assets.map(aa => (
                                    <div key={aa.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                        <div>
                                            <p className="font-bold text-lg">{aa.asset.name}</p>
                                            <p className="text-gray-500">{aa.asset.identifier}</p>
                                        </div>
                                        <span className="text-orange-500 font-medium">Returning...</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => setStep('confirm')}
                        className="px-8 py-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-xl font-semibold text-gray-700 dark:text-gray-200"
                    >
                        Back
                    </button>
                    <button
                        onClick={completeAction}
                        className="px-12 py-4 rounded-xl bg-indigo-600 text-xl font-bold text-white shadow-lg hover:bg-indigo-700 transform transition hover:scale-105"
                    >
                        {actionType === 'checkin' ? 'Complete Check-In' : 'Complete Check-Out'}
                    </button>
                </div>
            </div>
        )
    }

    if (step === 'confirm') {
        // Sort assignments by time
        const sortedAssignments = selectedVolunteer?.assignments.sort((a, b) =>
            new Date(a.shift.start_time).getTime() - new Date(b.shift.start_time).getTime()
        ) || []

        return (
            <div className="flex h-full flex-col p-8">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{selectedVolunteer?.name}</h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">{selectedVolunteer?.group || 'Volunteer'}</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full">
                    {sortedAssignments.map(assignment => {
                        const isActive = assignment.checked_in && !assignment.checked_out_at
                        const isCompleted = assignment.checked_in && assignment.checked_out_at
                        const startTime = new Date(assignment.shift.start_time)
                        const endTime = new Date(assignment.shift.end_time)

                        return (
                            <div key={assignment.id} className={`p-6 rounded-xl border-2 transition-all ${isActive
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {assignment.shift.name || 'Shift'}
                                        </p>
                                        <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div>
                                        {isActive ? (
                                            <button
                                                onClick={() => handleShiftAction(assignment.id, 'checkout')}
                                                className="px-6 py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors flex items-center"
                                            >
                                                <LogOut className="h-5 w-5 mr-2" />
                                                Check Out
                                            </button>
                                        ) : isCompleted ? (
                                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                                                Completed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleShiftAction(assignment.id, 'checkin')}
                                                className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center"
                                            >
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Check In
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {sortedAssignments.length === 0 && (
                        <p className="text-center text-gray-500 text-xl">No shifts assigned.</p>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={reset}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    // Default: Search Step
    return (
        <div className="flex h-full flex-col items-center justify-center p-8">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-12 tracking-tight">
                Welcome!
            </h1>

            <div className="w-full max-w-2xl relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Start typing your name..."
                    className="w-full px-8 py-6 text-3xl rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all dark:bg-gray-800 dark:text-white"
                    autoFocus
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                    {isSearching ? (
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    ) : (
                        <Search className="h-10 w-10" />
                    )}
                </div>
            </div>

            <div className="mt-8 w-full max-w-2xl space-y-4">
                {searchResults.map(volunteer => (
                    <button
                        key={volunteer.id}
                        onClick={() => handleSelectVolunteer(volunteer)}
                        className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-between group transition-all"
                    >
                        <div className="text-left">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{volunteer.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{volunteer.group}</p>
                        </div>
                        <ArrowRight className="h-8 w-8 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                    </button>
                ))}
                {searchQuery.length > 0 && !isSearching && searchResults.length === 0 && (
                    <p className="text-center text-xl text-gray-500 mt-8">No volunteers found.</p>
                )}
            </div>
        </div>
    )
}
