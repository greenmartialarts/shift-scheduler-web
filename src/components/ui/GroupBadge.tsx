import { User, Shield, Briefcase, Users } from 'lucide-react'

export function GroupBadge({ name, count }: { name: string; count?: number | string }) {
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
