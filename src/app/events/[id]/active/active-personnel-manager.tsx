'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Users, Clock, User, Shield, Briefcase } from 'lucide-react'

function GroupBadge({ name }: { name: string }) {
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
            <span>{name}</span>
        </span>
    )
}

export default function ActivePersonnelManager({
    eventId,
    initialAssignments,
}: {
    eventId: string
    initialAssignments: any[]
}) {
    const [assignments, setAssignments] = useState(initialAssignments)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Subscribe to changes in the assignments table
        const channel = supabase
            .channel('active-personnel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'assignments',
                },
                () => {
                    // When any assignment changes (insert/update/delete), 
                    // we re-fetch the data to ensure everything is in sync.
                    // router.refresh() is a quick way to re-run server components,
                    // but since we want a smooth client update, we could also fetch here.
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    // Keep state in sync with server data
    useEffect(() => {
        setAssignments(initialAssignments)
    }, [initialAssignments])

    return (
        <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Volunteer</th>
                            <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Group</th>
                            <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Current Shift</th>
                            <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Assigned At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {assignments?.map((a: any) => (
                            <tr key={a.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all border-l-2 border-l-transparent hover:border-l-green-500">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-green-500/10 text-green-600 dark:text-green-400 font-black text-xs">
                                            {a.volunteer.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{a.volunteer.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm">
                                    {a.volunteer.group ? (
                                        <GroupBadge name={a.volunteer.group} />
                                    ) : (
                                        <span className="text-zinc-400 italic text-xs font-medium">No Group</span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{a.shift.name || 'Standard Shift'}</span>
                                        <span className="text-xs opacity-60">
                                            {new Date(a.shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(a.shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">
                                        <Clock className="w-4 h-4" />
                                        {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!assignments || assignments.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                                        <Users className="w-12 h-12 opacity-10" />
                                        <div>
                                            <p className="font-bold text-lg text-zinc-900 dark:text-zinc-50">No Active Personnel</p>
                                            <p className="italic text-sm">All cleared. No volunteers are currently checked in.</p>
                                        </div>
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
