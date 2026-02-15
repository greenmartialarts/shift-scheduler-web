'use client'

import { useState } from 'react'
import { addGroup, deleteGroup, updateGroup } from './actions'
import { useNotification } from '@/components/ui/NotificationProvider'
import { useRouter } from 'next/navigation'

type Group = {
    id: string
    name: string
    color: string | null
    description: string | null
    max_hours_default: number | null
    volunteer_count?: number
}

type Volunteer = {
    id: string
    name: string
    group: string | null
}

const COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // blue-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#f43f5e', // rose-500
]

const stringToColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % COLORS.length
    return COLORS[index]
}

export default function GroupManager({ eventId, groups, volunteers }: { eventId: string; groups: Group[]; volunteers: Volunteer[] }) {
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const { showAlert, showConfirm } = useNotification()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        color: '#3b82f6',
        description: '',
        max_hours_default: '',
    })

    const resetForm = () => {
        setFormData({
            name: '',
            color: '#3b82f6',
            description: '',
            max_hours_default: '',
        })
        setEditingId(null)
        setIsAdding(false)
    }

    const handleEdit = (group: Group) => {
        setFormData({
            name: group.name,
            color: group.color || '#3b82f6',
            description: group.description || '',
            max_hours_default: group.max_hours_default?.toString() || '',
        })
        setEditingId(group.id)
        setIsAdding(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const data = new FormData()
        data.append('name', formData.name)
        data.append('color', formData.color)
        data.append('description', formData.description)
        data.append('max_hours_default', formData.max_hours_default)

        let res
        if (editingId) {
            res = await updateGroup(eventId, editingId, data)
        } else {
            res = await addGroup(eventId, data)
        }

        if (res?.error) {
            showAlert('Error saving group: ' + res.error, 'error')
        } else {
            router.refresh()
            resetForm()
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await showConfirm({
            title: 'Delete Group',
            message: 'Are you sure? This might fail if volunteers are assigned to this group.',
            confirmText: 'Delete',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteGroup(eventId, id)
        if (res?.error) {
            showAlert('Error deleting group: ' + res.error, 'error')
        } else {
            router.refresh()
        }
    }

    // Identify discovered groups
    const explicitGroupNames = new Set(groups.map(g => g.name))
    const discoveredGroups = Array.from(new Set(volunteers.map(v => v.group).filter(Boolean)))
        .filter(name => !explicitGroupNames.has(name as string))
        .map(name => ({
            name: name as string,
            color: stringToColor(name as string),
            count: volunteers.filter(v => v.group === name).length
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Volunteer Groups</h2>
                <button
                    onClick={() => { resetForm(); setIsAdding(!isAdding); }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {isAdding ? 'Cancel' : 'Add Group'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="h-9 w-16 rounded border border-gray-300 dark:border-gray-600 p-1"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Max Hours</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.max_hours_default}
                                onChange={(e) => setFormData({ ...formData, max_hours_default: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {editingId ? 'Update Group' : 'Save Group'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                {groups.map((group) => (
                    <div key={group.id} className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow border-l-4" style={{ borderLeftColor: group.color || '#3b82f6' }}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{group.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(group)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-indigo-300 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(group.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <p>Volunteers: {group.volunteer_count || 0}</p>
                            {group.max_hours_default && <p>Default Max Hours: {group.max_hours_default}</p>}
                        </div>
                    </div>
                ))}
                {groups.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                        No explicit groups found. Create one to organize your volunteers.
                    </div>
                )}
            </div>

            {discoveredGroups.length > 0 && (
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Discovered Groups</h2>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        These groups were found in your volunteer list but haven&apos;t been explicitly created.
                        They are assigned a color automatically. Click &quot;Customize&quot; to save them as a permanent group.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {discoveredGroups.map((group) => (
                            <div key={group.name} className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow border-l-4" style={{ borderLeftColor: group.color }}>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{group.name}</h3>
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                name: group.name,
                                                color: group.color,
                                                description: '',
                                                max_hours_default: '',
                                            })
                                            setIsAdding(true)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-indigo-300 text-sm"
                                    >
                                        Customize
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">Auto-discovered</p>
                                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                    <p>Volunteers: {group.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
