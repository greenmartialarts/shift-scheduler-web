'use client'

import { Plus } from 'lucide-react'

type Template = {
    id: string
    name: string
    duration_hours: number
    required_groups: unknown
    allowed_groups: string[] | null
}

interface ShiftFormProps {
    templates: Template[]
    onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function ShiftForm({ templates, onSubmit }: ShiftFormProps) {
    return (
        <div className="overflow-hidden">
            <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border-indigo-500/20">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    Create Single Shift
                </h3>
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Shift Template</label>
                        <select
                            name="template_id"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                            onChange={(e) => {
                                const t = templates.find(t => t.id === e.target.value)
                                if (t) {
                                    const form = e.target.form as HTMLFormElement
                                    const nameInput = form.elements.namedItem('name') as HTMLInputElement
                                    if (nameInput) nameInput.value = t.name

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
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" className="button-premium px-8">Confirm Addition</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
