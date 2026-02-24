'use client'

import { Repeat } from 'lucide-react'

type Template = {
    id: string
    name: string
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

interface RecurringShiftFormProps {
    templates: Template[]
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
}

export default function RecurringShiftForm({ templates, onSubmit }: RecurringShiftFormProps) {
    return (
        <div className="overflow-hidden">
            <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border-blue-500/20">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-blue-500" />
                    Generate Recurring Sequence
                </h3>
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-4">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Template Protocol</label>
                        <select
                            name="template_id"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                            onChange={(e) => {
                                const t = templates.find(t => t.id === e.target.value)
                                if (t) {
                                    const form = e.target.form as HTMLFormElement
                                    const startInput = form.elements.namedItem('start_time') as HTMLInputElement
                                    const endInput = form.elements.namedItem('end_time') as HTMLInputElement
                                    if (startInput) startInput.value = t.default_start
                                    if (endInput) endInput.value = t.default_end
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
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">From</label>
                        <input
                            type="time"
                            name="start_time"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Until</label>
                        <input
                            type="time"
                            name="end_time"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Target Days</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <label key={day.value} className="relative group cursor-pointer inline-block">
                                    <input type="checkbox" name="days" value={day.value} className="peer sr-only" defaultChecked />
                                    <div className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-checked:text-white transition-all text-sm font-black text-zinc-500 text-center min-w-[60px]">
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
    )
}
