'use client'

import { FileText, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

interface ShiftFileUploadZoneProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (data: Array<Record<string, unknown>>) => Promise<void>
    uploading: boolean
}

export default function ShiftFileUploadZone({ isOpen, onClose, onUpload, uploading }: ShiftFileUploadZoneProps) {
    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                onUpload(results.data as Array<Record<string, unknown>>)
            },
            error: (error: Error) => {
                console.error('CSV Parsing Error:', error)
            }
        })
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative z-10">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">Upload Operations Map</h3>

                <div className="space-y-6">
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
                            <span className="font-bold uppercase tracking-tighter text-sm">Schema Validation</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['Name', 'Start (ISO)', 'End (ISO)', 'Groups (CSV)'].map(field => (
                                <div key={field} className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs font-black text-zinc-400">
                                    {field}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                        >
                            Abort
                        </button>
                        <label className="flex-[2] cursor-pointer button-premium py-4">
                            {uploading ? 'Parsing Database...' : 'Upload & Sync'}
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
