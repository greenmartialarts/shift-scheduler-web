'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useMemo } from 'react'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: Record<string, number | string | boolean> | string[] | null
    allowed_groups: string[] | null
    excluded_groups: string[] | null
}

interface EditShiftModalProps {
    shift: Shift
    onClose: () => void
    onUpdate: (data: FormData) => Promise<void>
}

export default function EditShiftModal({
    shift,
    onClose,
    onUpdate
}: EditShiftModalProps) {
    const requiredGroupsStr = useMemo(() => {
        if (!shift.required_groups) return ''
        if (Array.isArray(shift.required_groups)) return shift.required_groups.join(', ')
        return JSON.stringify(shift.required_groups)
    }, [shift.required_groups])


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
                className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden"
            >
                <div className="p-8 pb-0 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Edit Manifest</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={onUpdate} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1">Shift Identity</label>
                            <input
                                name="name"
                                defaultValue={shift.name || ''}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1">Commence</label>
                            <input
                                type="datetime-local"
                                name="start"
                                defaultValue={shift.start_time.slice(0, 16)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1">Conclude</label>
                            <input
                                type="datetime-local"
                                name="end"
                                defaultValue={shift.end_time.slice(0, 16)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1 uppercase">Required Groups (JSON or CSV)</label>
                            <textarea
                                name="required_groups"
                                defaultValue={requiredGroupsStr}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-sm leading-relaxed"
                            />
                            <p className="text-[10px] text-zinc-400 font-medium mt-2 italic">Format: [&apos;Group1&apos;, &apos;Group2&apos;] or {`{"Group1": 2}`}</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 pl-1 uppercase">Excluded Groups (CSV)</label>
                            <input
                                name="excluded_groups"
                                defaultValue={excludedGroupsStr}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 rounded-2xl bg-indigo-500 text-white font-black shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all"
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
