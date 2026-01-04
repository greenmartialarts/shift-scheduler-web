'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { addVolunteer, bulkAddVolunteers, deleteVolunteer, deleteAllVolunteers, updateVolunteer } from './actions'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/NotificationProvider'
import { Search, UserPlus, Trash2, Upload, FileText, X, Check, Edit2, Download, AlertCircle } from 'lucide-react'

type Volunteer = {
    id: string
    name: string
    group: string | null
    max_hours: number | null
}

type Group = {
    id: string
    name: string
    color: string | null
}

const COLORS = [
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#f43f5e', // rose-500
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
]

const stringToColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % COLORS.length
    return COLORS[index]
}

export default function VolunteerManager({
    eventId,
    initialVolunteers,
    groups,
}: {
    eventId: string
    initialVolunteers: Volunteer[]
    groups: Group[]
}) {
    const [volunteers, setVolunteers] = useState(initialVolunteers)
    const [search, setSearch] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const router = useRouter()
    const { showAlert, showConfirm } = useNotification()

    useEffect(() => {
        setVolunteers(initialVolunteers)
    }, [initialVolunteers])

    const filteredVolunteers = volunteers.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.group && v.group.toLowerCase().includes(search.toLowerCase()))
    )

    async function handleAdd(formData: FormData) {
        const res = await addVolunteer(eventId, formData)
        if (res?.error) {
            showAlert('Error adding volunteer: ' + res.error, 'error')
        } else {
            setIsAdding(false)
            router.refresh()
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedVolunteers = results.data.map((row: any) => {
                    const name = row['Name'] || row['name'] || row['Volunteer'] || row['volunteer'] || ''
                    const group = row['Group'] || row['group'] || row['Role'] || row['role'] || null
                    const maxHoursRaw = row['Max Hours'] || row['max_hours'] || row['Hours'] || row['hours'] || row['Limit'] || row['limit']

                    const max_hours = maxHoursRaw ? parseFloat(maxHoursRaw) : null

                    if (!name) return null

                    return {
                        name,
                        group,
                        max_hours
                    }
                }).filter(Boolean)

                if (parsedVolunteers.length === 0) {
                    setUploading(false)
                    showAlert('No valid volunteers found in CSV', 'warning')
                    return
                }

                const res = await bulkAddVolunteers(eventId, parsedVolunteers)
                setUploading(false)
                setIsUploadModalOpen(false)
                if (res?.error) {
                    showAlert('Error uploading volunteers: ' + res.error, 'error')
                } else {
                    router.refresh()
                }
            },
            error: (error) => {
                setUploading(false)
                showAlert('Error parsing CSV: ' + error.message, 'error')
            },
        })
    }

    async function handleDelete(id: string) {
        const confirmed = await showConfirm({
            title: 'Delete Volunteer',
            message: 'Are you sure you want to delete this volunteer?',
            confirmText: 'Delete',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteVolunteer(eventId, id)
        if (res?.error) {
            showAlert('Error deleting volunteer: ' + res.error, 'error')
        } else {
            showAlert('Volunteer deleted successfully', 'success')
            router.refresh()
        }
    }

    async function handleUpdate(volunteerId: string, formData: FormData) {
        const res = await updateVolunteer(eventId, volunteerId, formData)
        if (res?.error) {
            showAlert('Error updating volunteer: ' + res.error, 'error')
        } else {
            showAlert('Volunteer updated successfully', 'success')
            setEditingId(null)
            router.refresh()
        }
    }

    async function handleDeleteAll() {
        const confirmed = await showConfirm({
            title: 'Delete All Volunteers',
            message: 'Are you sure you want to delete ALL volunteers? This cannot be undone.',
            confirmText: 'Delete All',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteAllVolunteers(eventId)
        if (res?.error) {
            showAlert('Error deleting all volunteers: ' + res.error, 'error')
        } else {
            showAlert('All volunteers deleted successfully', 'success')
            router.refresh()
        }
    }

    const discoveredGroups = Array.from(new Set(volunteers.map(v => v.group).filter(Boolean))) as string[]
    const allGroupNames = Array.from(new Set([
        ...groups.map(g => g.name),
        ...discoveredGroups
    ])).sort()

    const getGroupColor = (groupName: string | null) => {
        if (!groupName) return '#9ca3af'
        const explicitGroup = groups.find(g => g.name === groupName)
        if (explicitGroup?.color) return explicitGroup.color
        return stringToColor(groupName)
    }

    return (
        <div className="space-y-8">
            {/* Header / Search Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search volunteers by name or group..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-zinc-50 outline-none transition-all placeholder:text-zinc-400 font-medium"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                    <button
                        onClick={handleDeleteAll}
                        className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold"
                        title="Delete All Volunteers"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="button-premium px-6"
                    >
                        {isAdding ? <X className="w-5 h-5 mr-1" /> : <UserPlus className="w-5 h-5 mr-2" />}
                        {isAdding ? 'Cancel' : 'Add Volunteer'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="overflow-hidden">
                    <div className="premium-card p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border-indigo-500/20">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-indigo-500" />
                            Create New Volunteer
                        </h3>
                        <form action={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Group Assignment</label>
                                <select
                                    name="group"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                >
                                    <option value="">No Group</option>
                                    {allGroupNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Max Hours (Weekly)</label>
                                <input
                                    type="number"
                                    name="max_hours"
                                    step="0.5"
                                    placeholder="Unlimited"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <button type="submit" className="button-premium px-8">Confirm Addition</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Section */}
            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Volunteer</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Group</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Max Hours</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredVolunteers.map((volunteer) => {
                                const isEditing = editingId === volunteer.id
                                return (
                                    <tr
                                        key={volunteer.id}
                                        className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                                    >
                                        {isEditing ? (
                                            <td colSpan={4} className="px-8 py-6">
                                                <form
                                                    action={(formData) => handleUpdate(volunteer.id, formData)}
                                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                                                >
                                                    <div className="md:col-span-1">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            defaultValue={volunteer.name}
                                                            required
                                                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <select
                                                            name="group"
                                                            defaultValue={volunteer.group || ''}
                                                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                        >
                                                            <option value="">No Group</option>
                                                            {allGroupNames.map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            name="max_hours"
                                                            defaultValue={volunteer.max_hours || ''}
                                                            step="0.5"
                                                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button type="submit" className="p-2 rounded-lg bg-green-500 text-white shadow-lg hover:scale-105 transition-transform">
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button type="button" onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:scale-105 transition-transform">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </form>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                                                            {volunteer.name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{volunteer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm">
                                                    {volunteer.group ? (
                                                        <span
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black text-white shadow-sm"
                                                            style={{ backgroundColor: getGroupColor(volunteer.group) }}
                                                        >
                                                            {volunteer.group}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-400 italic">None</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-zinc-500">
                                                    {volunteer.max_hours ? `${volunteer.max_hours} hours` : 'Unlimited'}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingId(volunteer.id)}
                                                            className="p-2 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                                                            title="Edit Volunteer"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(volunteer.id)}
                                                            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            title="Delete Volunteer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                )
                            })}
                            {filteredVolunteers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                                            <Search className="w-10 h-10 opacity-20" />
                                            <p className="font-bold italic">No matching volunteers found in this event.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CSV Export / Instructions / Links */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="premium-card p-6 bg-indigo-500/5 border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <Download className="w-6 h-6 text-indigo-500" />
                        <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Bulk Operations</h4>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic mb-6">
                        Efficiently scale your volunteer base. Use our standardized format to sync data across platforms.
                    </p>
                    <a
                        href="https://docs.google.com/spreadsheets/d/1SBULQrNoxh_ShzWPl9asw4AV1QL6vvviTmLr3ascY54/copy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                        <FileText className="w-4 h-4" />
                        Download CSV Template
                    </a>
                </div>
            </div>

            {/* Premium CSV Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div
                        onClick={() => setIsUploadModalOpen(false)}
                        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
                    />
                    <div
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative z-10"
                    >
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">Import Core Database</h3>

                        <div className="space-y-6">
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                                Prepare your CSV file for global distribution. The system will automatically detect headers and map fields.
                                <br />
                                <a
                                    href="https://docs.google.com/spreadsheets/d/1SBULQrNoxh_ShzWPl9asw4AV1QL6vvviTmLr3ascY54/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-2 not-italic"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download CSV Template
                                </a>
                            </p>

                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-bold uppercase tracking-tighter text-sm">Mapping Protocol</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Name', 'Group', 'Hours'].map(field => (
                                        <div key={field} className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs font-black text-zinc-400">
                                            {field}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                                >
                                    Abort
                                </button>
                                <label className="flex-[2] cursor-pointer button-premium py-4">
                                    {uploading ? 'Processing Architecture...' : 'Upload & Distribute'}
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
