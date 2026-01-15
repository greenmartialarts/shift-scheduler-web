'use client'

import { Calendar, Edit2, Trash2, Search } from 'lucide-react'
import { GroupBadge } from '@/components/ui/GroupBadge'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: Record<string, any> | string[] | null
    allowed_groups: string[] | null
    excluded_groups: string[] | null
}

interface ShiftListProps {
    shifts: Shift[]
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export default function ShiftList({ shifts, onEdit, onDelete }: ShiftListProps) {
    return (
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
                        {shifts.map((shift) => {
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
                                                onClick={() => onEdit(shift.id)}
                                                className="p-2 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                                                title="Edit Shift"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(shift.id)}
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
                        {shifts.length === 0 && (
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
    )
}
