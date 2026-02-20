import { motion } from 'framer-motion'
import { X, Check, ChevronDown } from 'lucide-react'
import { useMemo, useState, useRef, useEffect } from 'react'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: Record<string, number | string | boolean> | string[] | null
    allowed_groups: string[] | null
    excluded_groups: string[] | null
}

type VolunteerGroup = {
    id: string
    name: string
    color: string | null
}

interface EditShiftModalProps {
    eventId: string
    shift: Shift
    groups: VolunteerGroup[]
    onClose: () => void
    onUpdate: (data: FormData) => Promise<void>
}

export default function EditShiftModal({
    eventId,
    shift,
    groups,
    onClose,
    onUpdate
}: EditShiftModalProps) {
    const [selectedGroups, setSelectedGroups] = useState<string[]>(() => {
        const allowed = shift.allowed_groups || []
        const required = shift.required_groups
            ? (Array.isArray(shift.required_groups) ? shift.required_groups : Object.keys(shift.required_groups))
            : []
        // Ensure strings and no duplicates
        return Array.from(new Set([...allowed, ...required])).filter(g => typeof g === 'string')
    })
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

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

    const initialRequirements = useMemo(() => {
        if (!shift.required_groups) return {}
        if (Array.isArray(shift.required_groups)) {
            const reqs: Record<string, number> = {}
            shift.required_groups.forEach(g => {
                if (typeof g === 'string') reqs[g] = 1
            })
            return reqs
        }
        const reqs: Record<string, number> = {}
        Object.entries(shift.required_groups).forEach(([k, v]) => {
            reqs[k] = typeof v === 'number' ? v : parseInt(String(v)) || 1
        })
        return reqs
    }, [shift.required_groups])

    const [requirements, setRequirements] = useState<Record<string, number>>(initialRequirements)

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




    const excludedGroupsStr = useMemo(() => {
        if (!shift.excluded_groups) return ''
        return shift.excluded_groups.join(', ')
    }, [shift.excluded_groups])

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
                <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Edit Manifest</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={onUpdate} className="p-8 pt-0 space-y-6 overflow-y-auto premium-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1">Shift Identity</label>
                            <input
                                name="name"
                                defaultValue={shift.name || ''}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1">Commence</label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                defaultValue={shift.start_time.slice(0, 16)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1">Conclude</label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                defaultValue={shift.end_time.slice(0, 16)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="md:col-span-2 relative" ref={dropdownRef}>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1 uppercase font-black tracking-widest text-zinc-400">Assigned Groups</label>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            >
                                <span className="truncate font-bold text-zinc-900 dark:text-zinc-50">
                                    {selectedGroups.length === 0
                                        ? 'Select volunteer groups...'
                                        : `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`
                                    }
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto premium-scrollbar">
                                    <div className="p-2 space-y-1">
                                        {groups.length === 0 ? (
                                            <div className="p-4 text-center">
                                                <p className="text-sm text-zinc-500 italic mb-2">No groups found</p>
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
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Requirements Count</label>
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
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1 uppercase">Excluded Groups (CSV)</label>
                            <input
                                name="excluded_groups"
                                defaultValue={excludedGroupsStr}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 pb-4 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 rounded-2xl bg-blue-500 text-white font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
                        >
                            <Check className="w-5 h-5" />
                            Save Modifications
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
