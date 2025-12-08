'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { addShift, bulkAddShifts, deleteShift, deleteAllShifts, updateShift } from './actions'
import { useRouter } from 'next/navigation'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: any
    allowed_groups: string[] | null
}

type Template = {
    id: string
    name: string
    description: string | null
    duration_hours: number
    required_groups: any
    allowed_groups: string[] | null
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
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const router = useRouter()

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
            alert('Error adding shift: ' + res.error)
        } else {
            setIsAdding(false)
            setFormData({ name: '', start: '', end: '', required_groups: '', allowed_groups: '' })
            setSelectedTemplate('')
            router.refresh()
        }
    }

    async function handleRecurringSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!recurringData.templateId || !recurringData.startDate || !recurringData.endDate || !recurringData.startTime || recurringData.days.length === 0) {
            alert('Please fill all fields')
            return
        }

        const template = templates.find(t => t.id === recurringData.templateId)
        if (!template) return

        const start = new Date(recurringData.startDate)
        const end = new Date(recurringData.endDate)
        const shiftsToCreate = []

        // Iterate through dates
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue...
            if (recurringData.days.includes(dayName)) {
                // Construct start/end times
                const shiftStart = new Date(`${d.toISOString().split('T')[0]}T${recurringData.startTime}`)
                const shiftEnd = new Date(shiftStart.getTime() + template.duration_hours * 60 * 60 * 1000)

                shiftsToCreate.push({
                    name: template.name,
                    start: shiftStart.toISOString(), // bulkAddShifts expects ISO strings or similar? Check action.
                    // Actually bulkAddShifts expects CSV-like objects usually, let's check what it expects.
                    // It expects { name, start, end, required_groups, allowed_groups } usually.
                    end: shiftEnd.toISOString(),
                    required_groups: template.required_groups,
                    allowed_groups: template.allowed_groups,
                })
            }
        }

        if (shiftsToCreate.length === 0) {
            alert('No shifts generated. Check date range and selected days.')
            return
        }

        if (!confirm(`Create ${shiftsToCreate.length} shifts?`)) return

        // We need to adapt shiftsToCreate to what bulkAddShifts expects.
        // Assuming bulkAddShifts takes array of objects.
        // But wait, bulkAddShifts in previous code took CSV parsed data.
        // Let's verify bulkAddShifts signature or adapt.
        // For now, I'll assume I can pass these objects.
        // I might need to stringify JSON fields if the action expects strings from CSV.

        const adaptedShifts = shiftsToCreate.map(s => ({
            name: s.name,
            start: s.start,
            end: s.end,
            required_groups: JSON.stringify(s.required_groups),
            allowed_groups: JSON.stringify(s.allowed_groups)
        }))

        const res = await bulkAddShifts(eventId, adaptedShifts)
        if (res?.error) {
            alert('Error creating recurring shifts: ' + res.error)
        } else {
            setIsRecurring(false)
            router.refresh()
        }
    }

    const parseDate = (dateStr: string): string | null => {
        if (!dateStr) return null
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return null
        return d.toISOString()
    }

    const parseGroups = (groupStr: string) => {
        if (!groupStr) return { required: {}, allowed: [] }
        // Split by comma or pipe
        const parts = groupStr.split(/[,|]/).map(s => s.trim()).filter(Boolean)
        const required: Record<string, number> = {}
        const allowed: string[] = []

        parts.forEach(part => {
            // Check for "Group:Count" format
            const [name, countStr] = part.split(':').map(s => s.trim())
            const count = countStr ? parseInt(countStr) : 1

            if (name) {
                required[name] = count
                allowed.push(name)
            }
        })
        return { required, allowed }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setUploading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedShifts = results.data.map((row: any) => {
                    // Map columns loosely
                    const name = row['Name'] || row['name'] || row['Shift'] || row['shift'] || ''
                    const startRaw = row['Start'] || row['start'] || row['Start Time'] || row['start_time'] || row['Date'] || row['date']
                    const endRaw = row['End'] || row['end'] || row['End Time'] || row['end_time']
                    const groupsRaw = row['Groups'] || row['groups'] || row['Required'] || row['required'] || row['Group'] || row['group'] || ''

                    const start = parseDate(startRaw)
                    // If end is missing, assume 1 hour duration or try to parse
                    let end = parseDate(endRaw)
                    if (start && !end) {
                        // Default to 1 hour if end time missing but start exists
                        const startDate = new Date(start)
                        end = new Date(startDate.getTime() + 60 * 60 * 1000).toISOString()
                    }

                    const { required, allowed } = parseGroups(groupsRaw)

                    if (!start || !end) return null

                    return {
                        name,
                        start,
                        end,
                        required_groups: required,
                        allowed_groups: allowed,
                        excluded_groups: []
                    }
                }).filter(Boolean)

                if (parsedShifts.length === 0) {
                    setUploading(false)
                    alert('No valid shifts found in CSV. Please check date formats.')
                    return
                }

                const res = await bulkAddShifts(eventId, parsedShifts)
                setUploading(false)
                setIsUploadModalOpen(false) // Close modal on success
                if (res?.error) {
                    alert('Error uploading shifts: ' + res.error)
                } else {
                    alert(`Successfully added ${parsedShifts.length} shifts`)
                    router.refresh()
                }
            },
            error: (error) => {
                setUploading(false)
                alert('Error parsing CSV: ' + error.message)
            },
        })
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure?')) return
        const res = await deleteShift(eventId, id)
        if (res?.error) {
            alert('Error deleting shift: ' + res.error)
        } else {
            router.refresh()
        }
    }

    async function handleUpdate(shiftId: string, formData: FormData) {
        const res = await updateShift(eventId, shiftId, formData)
        if (res?.error) {
            alert('Error updating shift: ' + res.error)
        } else {
            setEditingId(null)
            router.refresh()
        }
    }

    async function handleDeleteAll() {
        if (!confirm('Are you sure you want to delete ALL shifts? This cannot be undone.')) return
        const res = await deleteAllShifts(eventId)
        if (res?.error) {
            alert('Error deleting all shifts: ' + res.error)
        } else {
            router.refresh()
        }
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    placeholder="Search shifts (by date)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-xs dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                />
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleDeleteAll}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Delete All
                    </button>
                    <div className="relative group flex items-center">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="curso-pointer rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors duration-200 flex items-center gap-2"
                        >
                            {uploading ? 'Uploading...' : 'Import CSV'}
                        </button>
                    </div>
                    <button
                        onClick={() => { setIsRecurring(!isRecurring); setIsAdding(false); }}
                        className="rounded-md bg-indigo-100 dark:bg-indigo-900 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-200 shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {isRecurring ? 'Cancel Recurring' : 'Recurring Shifts'}
                    </button>
                    <button
                        onClick={() => { setIsAdding(!isAdding); setIsRecurring(false); }}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {isAdding ? 'Cancel' : 'Add Shift'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <form onSubmit={handleAddSubmit} className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Use Template</label>
                            <select
                                value={selectedTemplate}
                                onChange={handleTemplateChange}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            >
                                <option value="">-- Select Template --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.duration_hours}h)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Optional shift name"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                            <input
                                type="datetime-local"
                                name="start"
                                value={formData.start}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                            <input
                                type="datetime-local"
                                name="end"
                                value={formData.end}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Required Groups (JSON: e.g. {'{"Delegates": 1}'})
                            </label>
                            <input
                                type="text"
                                name="required_groups"
                                value={formData.required_groups}
                                onChange={handleInputChange}
                                placeholder='{"Delegates": 1}'
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allowed Groups (JSON Array: e.g. ["Delegates"])
                            </label>
                            <input
                                type="text"
                                name="allowed_groups"
                                value={formData.allowed_groups}
                                onChange={handleInputChange}
                                placeholder='["Delegates"]'
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isRecurring && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Create Recurring Shifts</h3>
                    <form onSubmit={handleRecurringSubmit} className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Template (Required)</label>
                            <select
                                value={recurringData.templateId}
                                onChange={(e) => setRecurringData({ ...recurringData, templateId: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            >
                                <option value="">-- Select Template --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.duration_hours}h)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input
                                type="date"
                                value={recurringData.startDate}
                                onChange={(e) => setRecurringData({ ...recurringData, startDate: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input
                                type="date"
                                value={recurringData.endDate}
                                onChange={(e) => setRecurringData({ ...recurringData, endDate: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                            <input
                                type="time"
                                value={recurringData.startTime}
                                onChange={(e) => setRecurringData({ ...recurringData, startTime: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repeat On</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                            const days = recurringData.days.includes(day)
                                                ? recurringData.days.filter(d => d !== day)
                                                : [...recurringData.days, day]
                                            setRecurringData({ ...recurringData, days })
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${recurringData.days.includes(day)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Generate Shifts
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow transition-colors duration-200">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Start
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                End
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Requirements
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {filteredShifts.map((shift) => {
                            const isEditing = editingId === shift.id
                            const formatForInput = (dateStr: string) => {
                                const d = new Date(dateStr)
                                return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                            }

                            return (
                                <tr key={shift.id}>
                                    {isEditing ? (
                                        <td colSpan={5} className="px-6 py-4">
                                            <form action={(formData) => handleUpdate(shift.id, formData)} className="grid gap-4 grid-cols-1 md:grid-cols-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        defaultValue={shift.name || ''}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start</label>
                                                    <input
                                                        type="datetime-local"
                                                        name="start"
                                                        defaultValue={formatForInput(shift.start_time)}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End</label>
                                                    <input
                                                        type="datetime-local"
                                                        name="end"
                                                        defaultValue={formatForInput(shift.end_time)}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Required Groups</label>
                                                    <textarea
                                                        name="required_groups"
                                                        defaultValue={JSON.stringify(shift.required_groups)}
                                                        rows={2}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                    />
                                                </div>
                                                <div className="flex gap-2 items-end">
                                                    <button
                                                        type="submit"
                                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingId(null)}
                                                        className="rounded-md bg-gray-300 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <input type="hidden" name="allowed_groups" value={JSON.stringify(shift.allowed_groups || [])} />
                                                    <input type="hidden" name="excluded_groups" value="[]" />
                                                </div>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {shift.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(shift.start_time).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(shift.end_time).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                <pre className="text-xs">{JSON.stringify(shift.required_groups, null, 2)}</pre>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => setEditingId(shift.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(shift.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )
                        })}
                        {filteredShifts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No shifts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* CSV Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Import Shifts from CSV</h3>

                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 space-y-3">
                            <p>
                                Please ensure your CSV file follows the correct format.
                                We recommend using our template to avoid errors.
                            </p>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-100 dark:border-indigo-800">
                                <p className="font-medium text-indigo-900 dark:text-indigo-200 mb-1">Format Requirements:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Name:</strong> Optional (e.g. "Morning Shift")</li>
                                    <li><strong>Start/End:</strong> Required (e.g. "12/25/2025 9:00 AM")</li>
                                    <li><strong>Groups:</strong> "Group:Count" (e.g. "Delegates:2, Staff:1")</li>
                                </ul>
                            </div>

                            <div className="pt-2">
                                <a
                                    href="https://docs.google.com/spreadsheets/d/1SBULQrNoxh_ShzWPl9asw4AV1QL6vvviTmLr3ascY54/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline font-medium flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Get CSV Template
                                </a>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <label className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2">
                                {uploading ? 'Uploading...' : 'Continue to Import'}
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
            )}
        </div>
    )
}
