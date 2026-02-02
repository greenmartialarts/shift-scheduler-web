'use client'

type Log = {
    id: string
    type: string
    description: string
    volunteer_id: string | null
    metadata: Record<string, unknown> | null
    created_at: string
    volunteers?: { id: string; name: string } | { id: string; name: string }[] | null
}

export default function AuditLogManager({
    eventId,
    eventName,
    logs,
}: {
    eventId: string
    eventName: string
    logs: Log[]
}) {
    const exportCSV = () => {
        const rows = [['Time (UTC)', 'Type', 'Description', 'Volunteer']]
        logs.forEach((log) => {
            rows.push([
                new Date(log.created_at).toISOString(),
                log.type,
                log.description.replace(/"/g, '""'),
                (Array.isArray(log.volunteers) ? log.volunteers[0]?.name : log.volunteers?.name) || '-',
            ])
        })
        const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
        const link = document.createElement('a')
        link.href = encodeURI(csv)
        link.download = `${eventName.replace(/\s+/g, '_')}_audit_log.csv`
        link.click()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={exportCSV}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Export CSV
                </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Volunteer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                                        {log.description}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        {(Array.isArray(log.volunteers) ? log.volunteers[0]?.name : log.volunteers?.name) || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.length === 0 && (
                    <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                        No activity logged yet. Check-ins, check-outs, and asset actions will appear here.
                    </div>
                )}
            </div>
        </div>
    )
}
