import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    FileSpreadsheet,
    Clock,
    Printer,
    Calendar,
    Files,
    Download,
    FileText,
    Search,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { PremiumButton } from '@/components/ui/PremiumButton'

export type Volunteer = {
    id: string
    name: string
    group: string | null
}

export type Assignment = {
    id: string
    shift_id: string
    volunteer_id: string
    checked_in: boolean
    late_dismissed: boolean
    volunteer?: Volunteer
}

export type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    assignments?: Assignment[]
}

export default function ReportsManager({ eventName, volunteers, shifts }: { eventId: string, eventName: string, volunteers: Volunteer[], shifts: Shift[] }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'stats'>('overview')
    const [searchQuery, setSearchQuery] = useState('')

    // --- Calculations ---
    const volunteerStats = volunteers.map(vol => {
        let totalHours = 0
        let shiftsCompleted = 0
        let lateCount = 0
        let absentCount = 0
        const assignedShifts: { start: Date, end: Date, shiftId: string }[] = []

        shifts.forEach(shift => {
            const assignment = shift.assignments?.find(a => a.volunteer_id === vol.id)
            if (assignment) {
                const start = new Date(shift.start_time)
                const end = new Date(shift.end_time)
                const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

                assignedShifts.push({ start, end, shiftId: shift.id })

                if (assignment.checked_in) {
                    totalHours += durationHours
                    shiftsCompleted++
                } else {
                    // If shift is in the past and not checked in
                    if (new Date() > end) {
                        absentCount++
                    } else if (new Date() > start) {
                        lateCount++
                    }
                }
            }
        })

        return {
            ...vol,
            totalHours,
            shiftsCompleted,
            lateCount,
            absentCount,
            assignedShifts
        }
    })

    const filteredVolunteers = volunteerStats.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.group?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // --- Exports ---

    const exportMasterScheduleCSV = () => {
        const rows = [['Shift Name', 'Shift Start', 'Shift End', 'Volunteer Name', 'Group', 'Status']]

        shifts.forEach(shift => {
            const start = new Date(shift.start_time).toLocaleString()
            const end = new Date(shift.end_time).toLocaleTimeString()

            if (shift.assignments && shift.assignments.length > 0) {
                shift.assignments.forEach(a => {
                    const status = a.checked_in ? 'Present' : (new Date() > new Date(shift.end_time) ? 'Absent' : 'Scheduled')
                    rows.push([
                        shift.name || '-',
                        start,
                        end,
                        a.volunteer?.name || 'Unknown',
                        a.volunteer?.group || '-',
                        status
                    ])
                })
            } else {
                rows.push([shift.name || '-', start, end, 'UNFILLED', '-', '-'])
            }
        })

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${eventName}_master_schedule.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // iCal format: date in UTC as YYYYMMDDTHHmmssZ
    const toIcalDate = (d: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0')
        const y = d.getUTCFullYear()
        const m = pad(d.getUTCMonth() + 1)
        const day = pad(d.getUTCDate())
        const h = pad(d.getUTCHours())
        const min = pad(d.getUTCMinutes())
        const s = pad(d.getUTCSeconds())
        return `${y}${m}${day}T${h}${min}${s}Z`
    }

    const escapeIcal = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

    const exportEventIcal = () => {
        const lines: string[] = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Volunteer Scheduler//EN',
            'CALSCALE:GREGORIAN',
        ]
        shifts.forEach((shift) => {
            if (!shift.assignments?.length) return
            shift.assignments.forEach((a, i) => {
                const start = new Date(shift.start_time)
                const end = new Date(shift.end_time)
                const summary = `${shift.name || 'Shift'} - ${a.volunteer?.name || 'Volunteer'}`
                const uid = `assign-${shift.id}-${a.volunteer_id}-${i}@scheduler`
                lines.push(
                    'BEGIN:VEVENT',
                    `UID:${uid}`,
                    `DTSTAMP:${toIcalDate(new Date())}`,
                    `DTSTART:${toIcalDate(start)}`,
                    `DTEND:${toIcalDate(end)}`,
                    `SUMMARY:${escapeIcal(summary)}`,
                    `DESCRIPTION:${escapeIcal(eventName)}`,
                    'END:VEVENT'
                )
            })
        })
        lines.push('END:VCALENDAR')
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${eventName.replace(/\s+/g, '_')}_schedule.ics`
        link.click()
        URL.revokeObjectURL(url)
    }

    const exportVolunteerIcal = (volId: string) => {
        const vol = volunteerStats.find(v => v.id === volId)
        if (!vol) return
        const lines: string[] = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Volunteer Scheduler//EN',
            'CALSCALE:GREGORIAN',
        ]
        shifts.forEach((shift) => {
            const a = shift.assignments?.find(as => as.volunteer_id === volId)
            if (!a) return
            const start = new Date(shift.start_time)
            const end = new Date(shift.end_time)
            const summary = shift.name || 'Shift'
            const uid = `assign-${shift.id}-${volId}@scheduler`
            lines.push(
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${toIcalDate(new Date())}`,
                `DTSTART:${toIcalDate(start)}`,
                `DTEND:${toIcalDate(end)}`,
                `SUMMARY:${escapeIcal(summary)}`,
                `DESCRIPTION:${escapeIcal(eventName)} - ${escapeIcal(vol.name)}`,
                'END:VEVENT'
            )
        })
        lines.push('END:VCALENDAR')
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${eventName.replace(/\s+/g, '_')}_${vol.name.replace(/\s+/g, '_')}_schedule.ics`
        link.click()
        URL.revokeObjectURL(url)
    }

    const exportStatsCSV = () => {
        const rows = [['Name', 'Group', 'Total Hours', 'Shifts Completed', 'Late/Absent']]

        volunteerStats.forEach(stat => {
            rows.push([
                stat.name,
                stat.group || '-',
                stat.totalHours.toFixed(1),
                stat.shiftsCompleted.toString(),
                (stat.lateCount + stat.absentCount).toString()
            ])
        })

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${eventName}_volunteer_stats.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // --- PDF Generation ---

    const generateVolunteerPDF = (volId: string, doc?: jsPDF, isBulk = false) => {
        const vol = volunteerStats.find(v => v.id === volId)
        if (!vol) return

        const pdf = doc || new jsPDF()

        // Header
        pdf.setFontSize(18)
        pdf.text(eventName, 10, 20)
        pdf.setFontSize(14)
        pdf.text(`Volunteer Schedule: ${vol.name}`, 10, 30)

        // Stats
        pdf.setFontSize(10)
        pdf.text(`Group: ${vol.group || '-'}`, 10, 38)

        // Table Data
        const tableData: string[][] = []
        const myShifts = shifts.filter(s => s.assignments?.some(a => a.volunteer_id === volId))
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

        myShifts.forEach(s => {
            const start = new Date(s.start_time)
            const end = new Date(s.end_time)
            tableData.push([
                start.toLocaleDateString(),
                s.name || '-',
                `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                (end.getTime() - start.getTime()) / (1000 * 60 * 60) + ' hrs'
            ])
        })

        autoTable(pdf, {
            head: [['Date', 'Shift Name', 'Time', 'Duration']],
            body: tableData,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
            styles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
            margin: 10,
        })

        if (!isBulk) {
            pdf.save(`${eventName}_${vol.name.replace(/\s+/g, '_')}_schedule.pdf`)
        }
    }

    const generateBulkPDF = () => {
        const doc = new jsPDF()

        volunteerStats.forEach((vol, index) => {
            if (index > 0) doc.addPage()
            generateVolunteerPDF(vol.id, doc, true)
        })

        doc.save(`${eventName}_all_schedules.pdf`)
    }

    const generateSignInSheet = () => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(18)
        doc.text(eventName, 10, 20)
        doc.setFontSize(14)
        doc.text('Sign-In Sheet', 10, 30)
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 36)

        const tableData: { volunteer: string, shift: string, date: string, time: string, startObj: Date, shiftName: string }[] = []

        // Flatten assignments
        shifts.forEach(shift => {
            if (shift.assignments && shift.assignments.length > 0) {
                shift.assignments.forEach(a => {
                    const start = new Date(shift.start_time)
                    const end = new Date(shift.end_time)
                    tableData.push({
                        volunteer: a.volunteer?.name || 'Unknown',
                        shift: shift.name || '-',
                        date: start.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
                        time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                        startObj: start,
                        shiftName: shift.name || ''
                    })
                })
            }
        })

        // Sort
        tableData.sort((a, b) => {
            if (a.startObj.getTime() !== b.startObj.getTime()) return a.startObj.getTime() - b.startObj.getTime()
            if (a.shiftName !== b.shiftName) return a.shiftName.localeCompare(b.shiftName)
            return a.volunteer.localeCompare(b.volunteer)
        })

        // Generate Table
        autoTable(doc, {
            head: [['Volunteer Name', 'Shift', 'Date', 'Time', 'Checked In', 'Checked Out']],
            body: tableData.map(r => [r.volunteer, r.shift, r.date, r.time, '[   ]', '[   ]']),
            startY: 40,
            theme: 'grid',
            styles: { minCellHeight: 15, valign: 'middle', textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 40 },
                2: { cellWidth: 25 },
                3: { cellWidth: 35 },
                4: { cellWidth: 20, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' }
            },
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
            margin: 10,
        })

        doc.save(`${eventName}_signin_sheet.pdf`)
    }

    const ReportCard = ({
        title,
        desc,
        icon: Icon,
        onClick,
        buttonText,
        type = 'primary'
    }: {
        title: string,
        desc: string,
        icon: React.ElementType,
        onClick: () => void,
        buttonText: string,
        type?: 'primary' | 'secondary' | 'outline'
    }) => (
        <div className="premium-card p-6 flex flex-col justify-between group h-full">
            <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed italic">
                    {desc}
                </p>
            </div>
            <PremiumButton
                onClick={onClick}
                className="w-full justify-between group/btn py-2.5"
                variant={type === 'outline' ? 'secondary' : 'primary'}
            >
                {buttonText}
                <Download className="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
            </PremiumButton>
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-0 mb-8">
                <div className="flex gap-8">
                    {[
                        { id: 'overview', label: 'Overview & Exports' },
                        { id: 'stats', label: 'Volunteer Stats & PDFs' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'overview' | 'stats')}
                            className={`relative pb-4 text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-blue-600 dark:bg-blue-400" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                            <ReportCard
                                title="Master Schedule"
                                desc="Export the full list of all assignments, times, and statuses."
                                icon={FileSpreadsheet}
                                onClick={exportMasterScheduleCSV}
                                buttonText="Download CSV"
                            />
                            <ReportCard
                                title="Attendance & Hours"
                                desc="Export a summary of total hours worked and attendance records per volunteer."
                                icon={Clock}
                                onClick={exportStatsCSV}
                                buttonText="Download CSV"
                            />
                            <ReportCard
                                title="Sign-In Sheet"
                                desc="Print a blank sign-in sheet with all scheduled volunteers listed chronologically."
                                icon={Printer}
                                onClick={generateSignInSheet}
                                buttonText="Download PDF"
                            />
                            <ReportCard
                                title="Calendar"
                                desc="Export assigned shifts as an iCal file for Apple, Google, or Outlook."
                                icon={Calendar}
                                onClick={exportEventIcal}
                                buttonText="Download iCal"
                            />
                        </div>

                        {/* Bulk Actions Section */}
                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
                                        <Files className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Bulk Actions</h3>
                                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 italic">
                                            Generate individual schedule PDFs for EVERY volunteer in a single file (one page per volunteer).
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={generateBulkPDF}
                                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-200 dark:shadow-none"
                                >
                                    <FileText className="h-4 w-4" />
                                    Download All Schedules (PDF)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search volunteers or groups…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 transition-all"
                            />
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/50">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Total Hours</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Shifts</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Attendance</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {filteredVolunteers.map((vol) => (
                                            <tr key={vol.id} className="group hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold text-xs">
                                                            {vol.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{vol.name}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-tight text-zinc-400">{vol.group || 'No Group'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                                        {vol.totalHours.toFixed(1)}
                                                    </span>
                                                    <span className="ml-1 text-[10px] font-bold text-zinc-400 uppercase">hrs</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                                            {vol.shiftsCompleted}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {vol.lateCount + vol.absentCount > 0 ? (
                                                        <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 w-fit">
                                                            <AlertCircle className="h-3 w-3" />
                                                            <span className="text-[10px] font-black uppercase">
                                                                {vol.lateCount + vol.absentCount} Late/Absent
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Perfect</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => generateVolunteerPDF(vol.id)}
                                                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="Download PDF"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            PDF
                                                        </button>
                                                        <button
                                                            onClick={() => exportVolunteerIcal(vol.id)}
                                                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                                                            title="Download iCal"
                                                        >
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            iCal
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
