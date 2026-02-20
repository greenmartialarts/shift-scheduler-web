'use client'

import { Plus, Check, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

type Template = {
    id: string
    name: string
    duration_hours: number
    required_groups: unknown
    allowed_groups: string[] | null
}

type VolunteerGroup = {
    id: string
    name: string
    color: string | null
}

interface ShiftFormProps {
    eventId: string
    templates: Template[]
    groups: VolunteerGroup[]
    onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function ShiftForm({ eventId, templates, groups, onSubmit }: ShiftFormProps) {
    const [selectedGroups, setSelectedGroups] = useState<string[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [requirements, setRequirements] = useState<Record<string, number>>({})

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleGroup = (groupName: string) => {
        const isSelected = selectedGroups.includes(groupName)
        if (isSelected) {
            setSelectedGroups(prev => prev.filter(g => g !== groupName))
            const newReqs = { ...requirements }
            delete newReqs[groupName]
            setRequirements(newReqs)
        } else {
            setSelectedGroups(prev => [...prev, groupName])
            setRequirements(prev => ({ ...prev, [groupName]: 1 }))
        }
    }

    const updateCount = (groupName: string, delta: number) => {
        setRequirements(prev => ({
            ...prev,
            [groupName]: Math.max(1, (prev[groupName] || 1) + delta)
        }))
    }

    return (
        <div className="overflow-hidden">
            <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border-blue-500/20">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                    Create Single Shift
                </h3>
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Shift Template</label>
                        <select
                            name="template_id"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                            onChange={(e) => {
                                const t = templates.find(t => t.id === e.target.value)
                                if (t) {
                                    const form = e.target.form as HTMLFormElement
                                    const nameInput = form.elements.namedItem('name') as HTMLInputElement
                                    if (nameInput) nameInput.value = t.name

                                    // Pre-select groups and requirements from template
                                    if (t.required_groups && typeof t.required_groups === 'object' && !Array.isArray(t.required_groups)) {
                                        const reqs = t.required_groups as Record<string, number>
                                        setRequirements(reqs)
                                        setSelectedGroups(Object.keys(reqs))
                                    } else if (t.allowed_groups) {
                                        setSelectedGroups(t.allowed_groups)
                                        const newReqs: Record<string, number> = {}
                                        t.allowed_groups.forEach(g => newReqs[g] = 1)
                                        setRequirements(newReqs)
                                    } else {
                                        setSelectedGroups([])
                                        setRequirements({})
                                    }

                                    // Handle duration calculation if start is set
                                    const startInput = form.elements.namedItem('start_time') as HTMLInputElement
                                    const endInput = form.elements.namedItem('end_time') as HTMLInputElement
                                    if (startInput?.value && endInput) {
                                        const start = new Date(startInput.value)
                                        const end = new Date(start.getTime() + t.duration_hours * 60 * 60 * 1000)
                                        const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                        endInput.value = endStr
                                    }
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
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="md:col-span-2 relative" ref={dropdownRef}>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Assigned Groups</label>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                            <span className="truncate font-medium text-zinc-600 dark:text-zinc-400">
                                {selectedGroups.length === 0
                                    ? 'Select volunteer groups...'
                                    : `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`
                                }
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto premium-scrollbar">
                                <div className="p-2 space-y-1">
                                    {groups.length === 0 ? (
                                        <div className="p-4 text-center">
                                            <p className="text-sm text-zinc-500 italic mb-2">No groups found for this event</p>
                                            <a
                                                href={`/events/${eventId}/volunteers`}
                                                className="text-xs text-blue-500 font-bold hover:underline"
                                            >
                                                Assign groups to volunteers first →
                                            </a>
                                        </div>
                                    ) : (
                                        groups.map(group => (
                                            <button
                                                key={group.id}
                                                type="button"
                                                onClick={() => toggleGroup(group.name)}
                                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: group.color || '#3b82f6' }}
                                                    />
                                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{group.name}</span>
                                                </div>
                                                {selectedGroups.includes(group.name) && (
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        <input
                            type="hidden"
                            name="allowed_groups"
                            value={JSON.stringify(selectedGroups)}
                        />
                        <input
                            type="hidden"
                            name="required_groups"
                            value={JSON.stringify(requirements)}
                        />

                        {/* Selected Requirements List */}
                        {selectedGroups.length > 0 && (
                            <div className="mt-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Requirements</label>
                                <div className="space-y-2">
                                    {selectedGroups.map(name => (
                                        <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{name}</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateCount(name, -1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-bold text-zinc-500"
                                                >
                                                    -
                                                </button>
                                                <span className="w-4 text-center font-black text-blue-500">{requirements[name] || 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateCount(name, 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-bold text-zinc-500"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Start Timestamp</label>
                        <input
                            type="datetime-local"
                            name="start_time"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            onChange={(e) => {
                                const form = e.target.form as HTMLFormElement
                                const templateId = (form.elements.namedItem('template_id') as HTMLSelectElement).value
                                const template = templates.find(t => t.id === templateId)
                                if (template && e.target.value) {
                                    const start = new Date(e.target.value)
                                    const end = new Date(start.getTime() + template.duration_hours * 60 * 60 * 1000)
                                    const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                    const endInput = form.elements.namedItem('end_time') as HTMLInputElement
                                    if (endInput) endInput.value = endStr
                                }
                            }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">End Timestamp</label>
                        <input
                            type="datetime-local"
                            name="end_time"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-4 flex justify-end mt-4">
                        <button type="submit" className="button-premium px-8">Confirm Addition</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
