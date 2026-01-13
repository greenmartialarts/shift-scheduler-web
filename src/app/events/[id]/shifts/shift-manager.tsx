'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Papa from 'papaparse'
import { addShift, bulkAddShifts, deleteShift, deleteAllShifts, updateShift } from './actions'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/NotificationProvider'
import ShiftTimeline from './shift-timeline'

import {
    Search,
    Calendar,
    Clock,
    Users,
    Trash2,
    Upload,
    Plus,
    Repeat,
    X,
    Check,
    Edit2,
    Download,
    AlertCircle,
    FileText,
    LayoutList,
    TrendingUp as TimelineIcon,
    User,
    Shield,
    Briefcase
} from 'lucide-react'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: string[] | null
    allowed_groups: string[] | null
}

type Template = {
    id: string
    name: string
    description: string | null
    duration_hours: number
    required_groups: any
    allowed_groups: string[] | null
    default_start: string
    default_end: string
}

const DAYS_OF_WEEK = [
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
    { label: 'Sun', value: '0' },
]
function GroupBadge({ name, count }: { name: string; count?: number | string }) {
    const config: Record<string, { color: string; icon: any }> = {
        Adults: { color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20', icon: User },
        Delegates: { color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: Users },
        Staff: { color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Shield },
        Security: { color: 'text-red-600 dark:text-red-400 bg-red-500/20 border-red-500/20', icon: Shield },
        Medical: { color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20', icon: Briefcase },
        Coordinator: { color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Shield },
        default: { color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: Users }
    }

    const { color, icon: Icon } = config[name] || config.default

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${color} text-[10px] font-black uppercase tracking-wider transition-all cursor-default group/badge`}>
            <Icon className="w-3 h-3 transition-transform" />
            <span>
                {name}{count !== undefined ? `: ${count}` : ''}
            </span>
        </span>
    )
}


export default function ShiftManager({
    eventId,
    initialShifts,
    templates,
}: {
    eventId: string
    initialShifts: Shift[]
    templates: Template[]
}) {
    const [shifts, setShifts] = useState(initialShifts)
    const [search, setSearch] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [isRecurring, setIsRecurring] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [view, setView] = useState<'list' | 'timeline'>('list')
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const router = useRouter()
    const { showAlert, showConfirm } = useNotification()

    // Form states
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [formData, setFormData] = useState({
        name: '',
        start: '',
        end: '',
        required_groups: '',
        allowed_groups: '',
    })

    // Recurring form states
    const [recurringData, setRecurringData] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        days: [] as string[], // Mon, Tue, etc.
        templateId: '',
    })

    useEffect(() => {
        setShifts(initialShifts)
    }, [initialShifts])

    const filteredShifts = shifts.filter((s) => {
        const start = new Date(s.start_time).toLocaleString()
        return start.toLowerCase().includes(search.toLowerCase())
    })

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value
        setSelectedTemplate(templateId)
        if (templateId) {
            const template = templates.find((t) => t.id === templateId)
            if (template) {
                setFormData({
                    ...formData,
                    name: template.name,
                    required_groups: JSON.stringify(template.required_groups),
                    allowed_groups: JSON.stringify(template.allowed_groups || []),
                })
                // Auto-calculate end time if start time is set
                if (formData.start) {
                    const start = new Date(formData.start)
                    const end = new Date(start.getTime() + template.duration_hours * 60 * 60 * 1000)
                    // Format for datetime-local: YYYY-MM-DDTHH:mm
                    const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    setFormData(prev => ({ ...prev, end: endStr }))
                }
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Auto-update end time if start time changes and template is selected
        if (name === 'start' && selectedTemplate) {
            const template = templates.find((t) => t.id === selectedTemplate)
            if (template && value) {
                const start = new Date(value)
                const end = new Date(start.getTime() + template.duration_hours * 60 * 60 * 1000)
                const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                setFormData(prev => ({ ...prev, end: endStr }))
            }
        }
    }

    async function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault()
        const data = new FormData()
        data.append('name', formData.name)
        data.append('start', formData.start)
        data.append('end', formData.end)
        data.append('required_groups', formData.required_groups)
        data.append('allowed_groups', formData.allowed_groups)

        const res = await addShift(eventId, data)
        if (res?.error) {
            showAlert('Error adding shift: ' + res.error, 'error')
        } else {
            setIsAdding(false)
            setFormData({ name: '', start: '', end: '', required_groups: '', allowed_groups: '' })
            setSelectedTemplate('')
            router.refresh()
        }
    }

    async function handleRecurringSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const templateId = formData.get('template_id') as string
        const startDate = formData.get('start_date') as string
        const endDate = formData.get('end_date') as string
        const startTime = formData.get('start_time') as string
        const endTime = formData.get('end_time') as string
        const selectedDays = formData.getAll('days') as string[]

        if (!startDate || !endDate || !startTime || !endTime || selectedDays.length === 0) {
            showAlert('Please fill in all recurring fields', 'warning')
            return
        }

        const template = templates.find(t => t.id === templateId)
        const generatedShifts = []
        let current = new Date(startDate + 'T00:00:00')
        const end = new Date(endDate + 'T23:59:59')

        while (current <= end) {
            if (selectedDays.includes(current.getDay().toString())) {
                const dateStr = current.toISOString().split('T')[0]
                generatedShifts.push({
                    name: template ? `${template.name}` : 'Generated Shift',
                    start_time: `${dateStr}T${startTime}:00`,
                    end_time: `${dateStr}T${endTime}:00`,
                    required_groups: template?.required_groups || []
                })
            }
            current.setDate(current.getDate() + 1)
        }

        if (generatedShifts.length === 0) {
            showAlert('No shifts generated for the selected criteria', 'warning')
            return
        }

        const res = await bulkAddShifts(eventId, generatedShifts)
        if (res?.error) {
            showAlert('Error generating shifts: ' + res.error, 'error')
        } else {
            setIsRecurring(false)
            router.refresh()
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedShifts = results.data.map((row: any) => {
                    const name = row['Name'] || row['name'] || row['Shift'] || row['shift'] || ''
                    const startRaw = row['Start'] || row['start'] || row['Start Time'] || row['start_time']
                    const endRaw = row['End'] || row['end'] || row['End Time'] || row['end_time']
                    const groupsRaw = row['Groups'] || row['groups'] || row['Required Groups'] || row['required_groups']

                    if (!name || !startRaw || !endRaw) return null

                    let groups: string[] = []
                    if (groupsRaw) {
                        groups = groupsRaw.split(',').map((g: string) => g.trim()).filter(Boolean)
                    }

                    return {
                        name,
                        start_time: new Date(startRaw).toISOString(),
                        end_time: new Date(endRaw).toISOString(),
                        required_groups: groups
                    }
                }).filter(Boolean)

                if (parsedShifts.length === 0) {
                    setUploading(false)
                    showAlert('No valid shifts found in CSV', 'warning')
                    return
                }

                const res = await bulkAddShifts(eventId, parsedShifts as any)
                setUploading(false)
                setIsUploadModalOpen(false)
                if (res?.error) {
                    showAlert('Error uploading shifts: ' + res.error, 'error')
                } else {
                    router.refresh()
                }
            },
            error: (error) => {
                setUploading(false)
                showAlert('Error parsing CSV: ' + error.message, 'error')
            },
        })
    }

    async function handleDelete(id: string) {
        const confirmed = await showConfirm({
            title: 'Delete Shift',
            message: 'Are you sure you want to delete this shift?',
            confirmText: 'Delete',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteShift(eventId, id)
        if (res?.error) {
            showAlert('Error deleting shift: ' + res.error, 'error')
        } else {
            showAlert('Shift deleted successfully', 'success')
            router.refresh()
        }
    }

    async function handleUpdate(shiftId: string, formData: FormData) {
        const res = await updateShift(eventId, shiftId, formData)
        if (res?.error) {
            showAlert('Error updating shift: ' + res.error, 'error')
        } else {
            showAlert('Shift updated successfully', 'success')
            setEditingId(null)
            router.refresh()
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
            showAlert('All shifts deleted successfully', 'success')
            router.refresh()
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
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <Repeat className="w-5 h-5" />
                        <span>Recurring</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding)
                            setIsRecurring(false)
                        }}
                        className="button-premium px-6"
                    >
                        {isAdding ? <X className="w-5 h-5 mr-1" /> : <Plus className="w-5 h-5 mr-2" />}
                        {isAdding ? 'Cancel' : 'Add Shift'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="overflow-hidden">
                    <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border-indigo-500/20">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-500" />
                            Create Single Shift
                        </h3>
                        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Shift Template</label>
                                <select
                                    name="template_id"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                    onChange={(e) => {
                                        const t = templates.find(t => t.id === e.target.value)
                                        if (t) {
                                            const nameInput = (e.target.form as HTMLFormElement).elements.namedItem('name') as HTMLInputElement
                                            if (nameInput) nameInput.value = t.name
                                        }
                                    }}
                                >
                                    <option value="">Custom Shift</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Start Timestamp</label>
                                <input
                                    type="datetime-local"
                                    name="start_time"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">End Timestamp</label>
                                <input
                                    type="datetime-local"
                                    name="end_time"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <button type="submit" className="button-premium px-8">Confirm Addition</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRecurring && (
                <div className="overflow-hidden">
                    <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border-indigo-500/20">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                            <Repeat className="w-5 h-5 text-indigo-500" />
                            Generate Recurring Sequence
                        </h3>
                        <form onSubmit={handleRecurringSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-4">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Template Protocol</label>
                                <select
                                    name="template_id"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                    onChange={(e) => {
                                        const t = templates.find(t => t.id === e.target.value)
                                        if (t) {
                                            const form = e.target.form as HTMLFormElement
                                                ; (form.elements.namedItem('start_time') as HTMLInputElement).value = t.default_start
                                                ; (form.elements.namedItem('end_time') as HTMLInputElement).value = t.default_end
                                        }
                                    }}
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">From</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Until</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Target Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <label key={day.value} className="relative group cursor-pointer inline-block">
                                            <input type="checkbox" name="days" value={day.value} className="peer sr-only" defaultChecked />
                                            <div className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 peer-checked:text-white transition-all text-sm font-black text-zinc-500 text-center min-w-[60px]">
                                                {day.label}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <button type="submit" className="button-premium px-8">Execute Generation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Section */}
            {view === 'list' ? (
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Shift Name</th>
                                    <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Timeframe</th>
                                    <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Required Groups</th>
                                    <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredShifts.map((shift) => {
                                    const start = new Date(shift.start_time)
                                    const end = new Date(shift.end_time)

                                    return (
                                        <tr
                                            key={shift.id}
                                            className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all border-l-2 border-l-transparent hover:border-l-indigo-500"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{shift.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-zinc-900 dark:text-zinc-50">
                                                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-zinc-500 italic">
                                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm">
                                                <div className="flex flex-wrap gap-2">
                                                    {(() => {
                                                        const reqs = shift.required_groups as any

                                                        if (!reqs || (Array.isArray(reqs) && reqs.length === 0)) {
                                                            return <span className="text-zinc-400 italic text-xs font-medium">No requirements specified</span>
                                                        }

                                                        if (Array.isArray(reqs)) {
                                                            return reqs.map(g => <GroupBadge key={g} name={g} />)
                                                        }

                                                        if (typeof reqs === 'object') {
                                                            return Object.entries(reqs).map(([name, count]) => (
                                                                <GroupBadge key={name} name={name} count={count as number} />
                                                            ))
                                                        }

                                                        return null
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingId(shift.id)}
                                                        className="p-2 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                                                        title="Edit Shift"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(shift.id)}
                                                        className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                        title="Delete Shift"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredShifts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3 text-zinc-400">
                                                <Search className="w-10 h-10 opacity-20" />
                                                <p className="font-bold italic">No matching shifts located.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <ShiftTimeline
                    shifts={filteredShifts}
                    onEdit={setEditingId}
                    onDelete={handleDelete}
                />
            )}

            {/* CSV Template / Instructions */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="premium-card p-6 bg-purple-500/5 border-purple-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <Download className="w-6 h-6 text-purple-500" />
                        <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Bulk Distribution</h4>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic mb-6">
                        Export shift sequences to external calendars or import complex schedules via our optimized CSV interface.
                    </p>
                    <a
                        href="https://docs.google.com/spreadsheets/d/1O6-0rN1hEIsU0Y8_id87Vf5N4lU7C79_lWf8X8pIDwE/copy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline"
                    >
                        <FileText className="w-4 h-4" />
                        Download Schedule Template
                    </a>
                </div>
            </div>

            {/* CSV Import Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div
                        onClick={() => setIsUploadModalOpen(false)}
                        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
                    />
                    <div
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative z-10"
                    >
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">Upload Operations Map</h3>

                        <div className="space-y-6">
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                                Inject multi-dimensional shift data into the event core. Ensure timestamps align with the local timezone.
                                <br />
                                <a
                                    href="https://docs.google.com/spreadsheets/d/1O6-0rN1hEIsU0Y8_id87Vf5N4lU7C79_lWf8X8pIDwE/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline mt-2 not-italic"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download Schedule Template
                                </a>
                            </p>

                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-bold uppercase tracking-tighter text-sm">Schema Validation</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Name', 'Start (ISO)', 'End (ISO)', 'Groups (CSV)'].map(field => (
                                        <div key={field} className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs font-black text-zinc-400">
                                            {field}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                                >
                                    Abort
                                </button>
                                <label className="flex-[2] cursor-pointer button-premium py-4">
                                    {uploading ? 'Parsing Database...' : 'Upload & Sync'}
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            <AnimatePresence>
                {editingId && (
                    <EditShiftModal
                        shift={shifts.find(s => s.id === editingId)!}
                        onClose={() => setEditingId(null)}
                        onUpdate={(formData) => handleUpdate(editingId, formData)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function EditShiftModal({
    shift,
    onClose,
    onUpdate
}: {
    shift: Shift,
    onClose: () => void,
    onUpdate: (data: FormData) => Promise<void>
}) {
    const requiredGroupsStr = useMemo(() => {
        if (!shift.required_groups) return ''
        if (Array.isArray(shift.required_groups)) return shift.required_groups.join(', ')
        return JSON.stringify(shift.required_groups)
    }, [shift.required_groups])

    const allowedGroupsStr = useMemo(() => {
        if (!shift.allowed_groups) return ''
        return shift.allowed_groups.join(', ')
    }, [shift.allowed_groups])

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
                        Edit Shift Details
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <form action={(fd) => { onUpdate(fd); onClose(); }} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Display Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={shift.name ?? ''}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Start Time</label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                defaultValue={shift.start_time.slice(0, 16)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">End Time</label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                defaultValue={shift.end_time.slice(0, 16)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Required Groups (JSON)</label>
                        <textarea
                            name="required_groups"
                            defaultValue={requiredGroupsStr}
                            placeholder='{"Medical": 1}'
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono text-xs h-24"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
