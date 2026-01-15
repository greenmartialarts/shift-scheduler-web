'use client'

import React, { useMemo, useRef } from 'react'
import { Calendar, Clock, Edit2, Trash2, Users } from 'lucide-react'

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    required_groups: Record<string, any> | string[] | null
    allowed_groups: string[] | null
    excluded_groups: string[] | null
}

interface ShiftTimelineProps {
    shifts: Shift[]
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export default function ShiftTimeline({ shifts, onEdit, onDelete }: ShiftTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // 1. Process Data
    const { timelineStart, timelineEnd, groups, hours } = useMemo(() => {
        if (shifts.length === 0) {
            return { timelineStart: new Date(), timelineEnd: new Date(), groups: [], hours: [] }
        }

        const starts = shifts.map(s => new Date(s.start_time).getTime())
        const ends = shifts.map(s => new Date(s.end_time).getTime())

        // Find overall range and buffer by 1 hour
        let start = new Date(Math.min(...starts))
        start.setMinutes(0, 0, 0)
        start = new Date(start.getTime() - 60 * 60 * 1000)

        let end = new Date(Math.max(...ends))
        end.setMinutes(0, 0, 0)
        end = new Date(end.getTime() + 2 * 60 * 60 * 1000)

        const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
        const hoursArray = Array.from({ length: totalHours + 1 }, (_, i) => {
            return new Date(start.getTime() + i * 60 * 60 * 1000)
        })

        // Identify unique groups for swimlanes
        const uniqueGroups = new Set<string>()
        shifts.forEach(s => {
            if (s.required_groups) {
                if (Array.isArray(s.required_groups)) {
                    if (s.required_groups.length > 0) {
                        s.required_groups.forEach(g => uniqueGroups.add(g))
                    } else {
                        uniqueGroups.add('Global')
                    }
                } else if (typeof s.required_groups === 'object') {
                    const keys = Object.keys(s.required_groups)
                    if (keys.length > 0) {
                        keys.forEach(k => uniqueGroups.add(k))
                    } else {
                        uniqueGroups.add('Global')
                    }
                }
            } else {
                uniqueGroups.add('Global')
            }
        })

        return {
            timelineStart: start,
            timelineEnd: end,
            groups: Array.from(uniqueGroups).sort(),
            hours: hoursArray
        }
    }, [shifts])

    const calculatePosition = (startTime: string, endTime: string) => {
        const start = new Date(startTime).getTime()
        const end = new Date(endTime).getTime()
        const total = timelineEnd.getTime() - timelineStart.getTime()

        const left = ((start - timelineStart.getTime()) / total) * 100
        const width = ((end - start) / total) * 100

        return { left: `${left}%`, width: `${width}%` }
    }

    if (shifts.length === 0) {
        return (
            <div className="premium-card p-12 text-center">
                <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4 opacity-20" />
                <p className="text-zinc-500 font-bold italic">No shifts to visualize in timeline.</p>
            </div>
        )
    }

    const HOUR_WIDTH = 120 // px per hour
    const ROW_HEIGHT = 80 // px per track

    return (
        <div className="premium-card overflow-hidden border-indigo-500/10">
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto custom-scrollbar"
                style={{ maxHeight: '600px' }}
            >
                <div
                    className="relative min-w-max"
                    style={{ width: `${hours.length * HOUR_WIDTH}px` }}
                >
                    {/* Time Header */}
                    <div className="sticky top-0 z-20 flex bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                        <div className="sticky left-0 z-30 w-48 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 px-6 py-4 font-black uppercase tracking-tighter text-zinc-400 text-xs text-center">
                            Group / Team
                        </div>
                        {hours.map((hour, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 px-4 py-4 text-[10px] font-black italic text-zinc-500"
                                style={{ width: `${HOUR_WIDTH}px` }}
                            >
                                <div className="flex flex-col">
                                    <span>{hour.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    <span className="text-indigo-500">{hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline Rows */}
                    <div className="relative">
                        {groups.map((group) => {
                            const groupShifts = shifts.filter(s => {
                                const hasGroup = Array.isArray(s.required_groups)
                                    ? s.required_groups.includes(group)
                                    : (s.required_groups && typeof s.required_groups === 'object' && group in s.required_groups)

                                const isGlobal = !s.required_groups ||
                                    (Array.isArray(s.required_groups) && s.required_groups.length === 0) ||
                                    (typeof s.required_groups === 'object' && Object.keys(s.required_groups).length === 0)

                                return hasGroup || (group === 'Global' && isGlobal)
                            }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

                            // Track assignment logic
                            const tracks: number[] = []
                            const shiftWithTracks = groupShifts.map(shift => {
                                const startTime = new Date(shift.start_time).getTime()
                                const endTime = new Date(shift.end_time).getTime()

                                let assignedTrack = 0
                                const foundTrack = tracks.findIndex(lastEndTime => lastEndTime <= startTime)

                                if (foundTrack === -1) {
                                    assignedTrack = tracks.length
                                    tracks.push(endTime)
                                } else {
                                    assignedTrack = foundTrack
                                    tracks[foundTrack] = endTime
                                }

                                return { ...shift, track: assignedTrack }
                            })

                            const totalRowHeight = Math.max(1, tracks.length) * ROW_HEIGHT

                            return (
                                <div key={group} className="flex border-b border-zinc-100 dark:border-zinc-900 group/row">
                                    {/* Row Header */}
                                    <div
                                        className="sticky left-0 z-10 w-48 flex-shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-r border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center"
                                        style={{ height: `${totalRowHeight}px` }}
                                    >
                                        <div className="flex flex-col gap-1 w-full text-center">
                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate">
                                                {group}
                                            </span>
                                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400">
                                                <Users className="w-3 h-3" />
                                                <span>{groupShifts.length} Shifts</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row Content (Shifts) */}
                                    <div className="relative flex-grow h-full" style={{ height: `${totalRowHeight}px` }}>
                                        {/* Vertical Hour Grid Lines */}
                                        {hours.map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute top-0 bottom-0 border-r border-zinc-100 dark:border-zinc-900/50 pointer-events-none"
                                                style={{ left: `${(i / (hours.length - 1)) * 100}%` }}
                                            />
                                        ))}

                                        {shiftWithTracks.map((shift) => {
                                            const pos = calculatePosition(shift.start_time, shift.end_time)
                                            return (
                                                <div
                                                    key={shift.id}
                                                    className="absolute h-16 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-3 group/item hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-default overflow-hidden"
                                                    style={{
                                                        ...pos,
                                                        top: `${shift.track * ROW_HEIGHT + 8}px`
                                                    }}
                                                >
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                                                                {shift.name}
                                                            </span>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onEdit(shift.id); }}
                                                                    className="p-1 rounded bg-white/50 dark:bg-zinc-800/50 hover:text-indigo-500"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onDelete(shift.id); }}
                                                                    className="p-1 rounded bg-white/50 dark:bg-zinc-800/50 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 italic">
                                                            <Clock className="w-3 h-3 text-indigo-400" />
                                                            <span>
                                                                {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
