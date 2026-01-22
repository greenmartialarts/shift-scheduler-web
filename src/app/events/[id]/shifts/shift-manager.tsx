'use client'

import { useState } from 'react'
import { Plus, Search, Upload, LayoutList, Calendar, Trash2 } from 'lucide-react'
import { useNotification } from '@/components/ui/NotificationProvider'
import { addShift, deleteShift, generateRecurringShifts, updateShift, deleteAllShifts, bulkAddShifts } from './actions'

// Extracted Components
import ShiftForm from './components/ShiftForm'
import RecurringShiftForm from './components/RecurringShiftForm'
import ShiftList from './components/ShiftList'
import ShiftFileUploadZone from './components/ShiftFileUploadZone'
import EditShiftModal from './components/EditShiftModal'
import ShiftTimeline from './shift-timeline'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: Record<string, string | number | boolean> | string[] | null
    allowed_groups: string[] | null
    excluded_groups: string[] | null
}

type Template = {
    id: string
    name: string
    duration_hours: number
    required_groups: unknown
    allowed_groups: string[] | null
    default_start: string
    default_end: string
}

export default function ShiftManager({
    eventId,
    shifts,
    templates,
}: {
    eventId: string
    shifts: Shift[]
    templates: Template[]
}) {
    const [isAdding, setIsAdding] = useState(false)
    const [isRecurring, setIsRecurring] = useState(false)
    const [search, setSearch] = useState('')
    const [view, setView] = useState<'list' | 'timeline'>('list')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    const { showAlert, showConfirm } = useNotification()

    const filteredShifts = shifts.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase())
    )

    async function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const res = await addShift(eventId, formData)
        if (res?.error) {
            showAlert('Error adding shift: ' + res.error, 'error')
        } else {
            window.location.reload()
        }
    }

    async function handleRecurringSubmit(e: React.FormEvent) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const res = await generateRecurringShifts(eventId, formData)
        if (res?.error) {
            showAlert('Error generating shifts: ' + res.error, 'error')
        } else {
            window.location.reload()
        }
    }

    async function handleFileUpload(data: Array<Record<string, unknown>>) {
        setUploading(true)
        const res = await bulkAddShifts(eventId, data)
        if (res?.error) {
            setUploading(false)
            showAlert('Error uploading shifts: ' + res.error, 'error')
        } else {
            window.location.reload()
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await showConfirm({
            title: 'Delete Shift',
            message: 'Are you sure you want to delete this shift?',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteShift(eventId, id)
        if (res?.error) {
            showAlert('Error deleting shift: ' + res.error, 'error')
        } else {
            window.location.reload()
        }
    }

    async function handleUpdate(shiftId: string, formData: FormData) {
        const res = await updateShift(eventId, shiftId, formData)
        if (res?.error) {
            showAlert('Error updating shift: ' + res.error, 'error')
        } else {
            window.location.reload()
        }
    }

    async function handleDeleteAll() {
        const confirmed = await showConfirm({
            title: 'Delete All Shifts',
            message: 'Are you sure you want to delete ALL shifts? This cannot be undone.',
            confirmText: 'Delete All',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteAllShifts(eventId)
        if (res?.error) {
            showAlert('Error deleting all shifts: ' + res.error, 'error')
        } else {
            window.location.reload()
        }
    }

    return (
        <div className="space-y-8">
            {/* Header / Search Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:max-w-2xl">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search shifts by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-zinc-50 outline-none transition-all placeholder:text-zinc-400 font-medium"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${view === 'list'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <LayoutList className="w-4 h-4" />
                            <span>List</span>
                        </button>
                        <button
                            onClick={() => setView('timeline')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${view === 'timeline'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Timeline</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                    <button
                        onClick={handleDeleteAll}
                        className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold"
                        title="Delete All Shifts"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        id="import-shifts-btn"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsRecurring(!isRecurring)
                            setIsAdding(false)
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-bold transition-all shadow-sm ${isRecurring
                            ? 'bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                            : 'bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        {isRecurring ? 'Cancel' : (
                            <>
                                <Calendar className="w-5 h-5" />
                                <span>Recurring</span>
                            </>
                        )}
                    </button>
                    <button
                        id="add-shift-btn"
                        onClick={() => {
                            setIsAdding(!isAdding)
                            setIsRecurring(false)
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-wider text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        {isAdding ? 'Cancel' : (
                            <>
                                <Plus className="w-5 h-5 mr-1" />
                                Add Shift
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Forms */}
            {isAdding && (
                <div className="premium-card p-6 bg-indigo-500/[0.02]">
                    <ShiftForm
                        templates={templates}
                        onSubmit={handleAddSubmit}
                    />
                </div>
            )}

            {isRecurring && (
                <div className="premium-card p-6 bg-zinc-900/5 dark:bg-zinc-50/5">
                    <RecurringShiftForm
                        templates={templates}
                        onSubmit={handleRecurringSubmit}
                    />
                </div>
            )}

            {/* Display Area */}
            {view === 'list' ? (
                <ShiftList
                    shifts={filteredShifts}
                    onEdit={setEditingId}
                    onDelete={handleDelete}
                />
            ) : (
                <ShiftTimeline
                    shifts={filteredShifts}
                    onEdit={setEditingId}
                    onDelete={handleDelete}
                />
            )}

            {/* Modals */}
            <ShiftFileUploadZone
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleFileUpload}
                onError={(msg) => showAlert(msg, 'error')}
                uploading={uploading}
            />

            {editingId && shifts.find(s => s.id === editingId) && (
                <EditShiftModal
                    shift={shifts.find(s => s.id === editingId)!}
                    onClose={() => setEditingId(null)}
                    onUpdate={(formData) => handleUpdate(editingId!, formData)}
                />
            )}
        </div>
    )
}
