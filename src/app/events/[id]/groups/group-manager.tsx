'use client'

import { useState } from 'react'
import { addGroup, deleteGroup, updateGroup } from './actions'
import { useRouter } from 'next/navigation'

type Group = {
    id: string
    name: string
    color: string | null
    description: string | null
    max_hours_default: number | null
    volunteer_count?: number
}

export default function GroupManager({ eventId, groups }: { eventId: string; groups: Group[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const router = useRouter()

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
            alert('Error saving group: ' + res.error)
        } else {
            resetForm()
            router.refresh()
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This might fail if volunteers are assigned to this group.')) return
        const res = await deleteGroup(eventId, id)
        if (res?.error) {
            alert('Error deleting group: ' + res.error)
        } else {
            router.refresh()
        }
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Volunteer Groups</h2>
                <button
                    onClick={() => { resetForm(); setIsAdding(!isAdding); }}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    {isAdding ? 'Cancel' : 'Add Group'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
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
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Max Hours</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.max_hours_default}
                                onChange={(e) => setFormData({ ...formData, max_hours_default: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                {editingId ? 'Update Group' : 'Save Group'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                    <div key={group.id} className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-colors duration-200 border-l-4" style={{ borderLeftColor: group.color || '#3b82f6' }}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{group.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(group)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
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
                        No groups found. Create one to organize your volunteers.
                    </div>
                )}
            </div>
        </div>
    )
}
