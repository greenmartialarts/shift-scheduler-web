'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface AnalyticsChartsProps {
    volunteersByGroup: { name: string; value: number }[];
    shiftFillStatus: { name: string; value: number }[];
}

const SIMPLE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

export function AnalyticsCharts({ volunteersByGroup, shiftFillStatus }: AnalyticsChartsProps) {
    const totalVolunteers = volunteersByGroup.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Volunteers by Group */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-8 transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Volunteers by Group
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Distribution analysis</p>
                    </div>
                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {totalVolunteers} Total
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={volunteersByGroup} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#2563EB" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(229, 231, 235, 0.5)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px',
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1E293B' }}
                                labelStyle={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: 'bold' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="url(#barGradient)"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Shift Fill Status */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-8 transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="mb-6">
                    <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Shift Fill Status
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recruitment tracking</p>
                </div>

                <div className="relative h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={shiftFillStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={95}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {shiftFillStatus.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={SIMPLE_COLORS[index % SIMPLE_COLORS.length]}
                                        className="transition-all duration-300 hover:opacity-80"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(229, 231, 235, 0.5)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px',
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1E293B' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Label for Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                            {Math.round((shiftFillStatus.find(s => s.name === 'Filled')?.value || 0) /
                                shiftFillStatus.reduce((acc, curr) => acc + curr.value, 0) * 100)}%
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Filled</span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    {shiftFillStatus.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: SIMPLE_COLORS[index % SIMPLE_COLORS.length] }}
                                />
                                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
