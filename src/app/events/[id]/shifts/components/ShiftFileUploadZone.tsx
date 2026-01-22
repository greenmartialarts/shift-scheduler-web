'use client'

import { FileText, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'
import { useState } from 'react'

interface ShiftFileUploadZoneProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (data: Array<Record<string, unknown>>) => Promise<void>
    onError?: (message: string) => void
    uploading: boolean
}

export default function ShiftFileUploadZone({ isOpen, onClose, onUpload, onError, uploading }: ShiftFileUploadZoneProps) {
    const [previewData, setPreviewData] = useState<Array<Record<string, unknown>> | null>(null)

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || []

                const nameAliases = ['Name', 'name', 'Shift', 'shift']
                const startAliases = ['Start', 'start_time', 'start', 'Begin', 'begin']
                const endAliases = ['End', 'end_time', 'end', 'Finish', 'finish']
                const groupAliases = ['Groups', 'required_groups']
                const allowedAliases = ['allowed_groups']
                const excludedAliases = ['excluded_groups']

                const allRecognized = [...nameAliases, ...startAliases, ...endAliases, ...groupAliases, ...allowedAliases, ...excludedAliases]
                const unrecognized = headers.filter(h => !allRecognized.includes(h))

                // Explicitly check for Volunteer headers to prevent cross-import errors
                const volunteerHeaders = ['Email', 'email', 'Phone', 'phone', 'Max Hours', 'max_hours']
                const hasVolunteerHeaders = headers.some(h => volunteerHeaders.includes(h))

                if (hasVolunteerHeaders) {
                    onError?.('It looks like you are trying to upload a Volunteer CSV. Please use the Volunteer Import feature in the "Volunteers" tab.')
                    return
                }

                if (unrecognized.length > 0) {
                    onError?.(`Invalid file format: Unrecognized columns found: ${unrecognized.join(', ')}. Please use the template.`)
                    return
                }

                const hasName = headers.some(h => nameAliases.includes(h))
                const hasStart = headers.some(h => startAliases.includes(h))
                const hasEnd = headers.some(h => endAliases.includes(h))

                if (!hasName || !hasStart || !hasEnd) {
                    const missing = []
                    if (!hasName) missing.push('Name')
                    if (!hasStart) missing.push('Start Time')
                    if (!hasEnd) missing.push('End Time')
                    onError?.(`Invalid file format: Missing columns: ${missing.join(', ')}`)
                    return
                }

                setPreviewData(results.data as Array<Record<string, unknown>>)
            },
            error: (error: Error) => {
                console.error('CSV Parsing Error:', error)
                onError?.(`Error parsing CSV: ${error.message}`)
            }
        })
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div
                onClick={() => {
                    onClose()
                    setPreviewData(null)
                }}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            <div className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full p-8 relative z-10 transition-all ${previewData ? 'max-w-2xl' : 'max-w-lg'}`}>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">
                    {previewData ? 'Review Shifts' : 'Upload Operations Map'}
                </h3>

                <div className="space-y-6">
                    {!previewData ? (
                        <>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                                Inject multi-dimensional shift data into the event core. Ensure timestamps align with the local timezone.
                                <br />
                                <a
                                    href="https://docs.google.com/spreadsheets/d/1O6-0rN1hEIsU0Y8_id87Vf5N4lU7C79_lWf8X8pIDwE/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline mt-2 not-italic"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download Schedule Template
                                </a>
                            </p>

                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-bold uppercase tracking-tighter text-sm">CSV Validation</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Name', 'Start (ISO)', 'End (ISO)', 'Groups (CSV)'].map(field => (
                                        <div key={field} className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs font-black text-zinc-400">
                                            {field}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
                                    <tr>
                                        <th className="px-4 py-2 font-bold">Shift Name</th>
                                        <th className="px-4 py-2 font-bold">Start</th>
                                        <th className="px-4 py-2 font-bold">Groups</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {previewData.slice(0, 50).map((s, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 font-medium">{(s.Name || s.name || s.Shift || s.shift) as string}</td>
                                            <td className="px-4 py-2 text-zinc-500 text-xs">
                                                {new Date((s.Start || s.start_time || s.start) as string).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-2 text-zinc-500 text-xs truncate max-w-[150px]">
                                                {(s.Groups || s.required_groups || '-') as string}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 50 && (
                                <p className="p-4 text-center text-xs text-zinc-400 italic">...and {previewData.length - 50} more</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                onClose()
                                setPreviewData(null)
                            }}
                            className="flex-1 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                        >
                            Cancel
                        </button>
                        {!previewData ? (
                            <label className="flex-[2] cursor-pointer button-premium py-4 text-center">
                                {uploading ? 'Parsing Database...' : 'Select File'}
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        ) : (
                            <button
                                onClick={() => {
                                    onUpload(previewData)
                                    setPreviewData(null)
                                }}
                                disabled={uploading}
                                className="flex-[2] button-premium py-4"
                            >
                                {uploading ? 'Injecting...' : `Confirm Injection (${previewData.length})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
