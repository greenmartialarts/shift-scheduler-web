'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Volunteer = {
    id: string
    name: string
    group: string | null
}

type Assignment = {
    id: string
    shift_id: string
    volunteer_id: string
    checked_in: boolean
    late_dismissed: boolean
    volunteer?: Volunteer
}

type Shift = {
    id: string
    name: string | null
    start_time: string
    end_time: string
    assignments?: Assignment[]
}

export default function ReportsManager({
    eventId,
    eventName,
    volunteers,
    shifts,
}: {
    eventId: string
    eventName: string
    volunteers: Volunteer[]
    shifts: Shift[]
}) {
    const [activeTab, setActiveTab] = useState<'overview' | 'stats'>('overview')

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
        // We need to find the actual shift details again or store them better
        // Let's iterate shifts to find assignments for this volunteer
        const myShifts = shifts.filter(s => s.assignments?.some(a => a.volunteer_id === volId))
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

        myShifts.forEach(s => {
            const start = new Date(s.start_time)
            const end = new Date(s.end_time)
            tableData.push([
                start.toLocaleDateString(),
                s.name || '-',
                `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                // @ts-ignore
                (end.getTime() - start.getTime()) / (1000 * 60 * 60) + ' hrs'
            ])
        })

        // @ts-ignore
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

        const tableData: any[] = []

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
        // @ts-ignore
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${activeTab === 'overview'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Overview & Exports
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`${activeTab === 'stats'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Volunteer Stats & PDFs
                    </button>
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Master Schedule</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Export the full list of all assignments, times, and statuses.
                                </p>
                                <button
                                    onClick={exportMasterScheduleCSV}
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Download CSV
                                </button>
                            </div>

                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Attendance & Hours</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Export a summary of total hours worked and attendance records per volunteer.
                                </p>
                                <button
                                    onClick={exportStatsCSV}
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Download CSV
                                </button>
                            </div>

                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign-In Sheet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Print a blank sign-in sheet with all scheduled volunteers listed chronologically.
                                </p>
                                <button
                                    onClick={generateSignInSheet}
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bulk Actions</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Generate individual schedule PDFs for EVERY volunteer in a single file (one page per volunteer).
                            </p>
                            <button
                                onClick={generateBulkPDF}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Download All Schedules (PDF)
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Hours</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Shifts</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Late/Absent</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {volunteerStats.map((vol) => (
                                    <tr key={vol.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{vol.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{vol.totalHours.toFixed(1)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{vol.shiftsCompleted}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {vol.lateCount + vol.absentCount > 0 ? (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    {vol.lateCount + vol.absentCount}
                                                </span>
                                            ) : (
                                                <span className="text-green-600 dark:text-green-400">0</span>
                                            )}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button
                                                onClick={() => generateVolunteerPDF(vol.id)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                Download PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
