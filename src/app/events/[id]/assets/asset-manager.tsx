'use client'

import { useState } from 'react'
import { addAsset, deleteAsset, updateAsset } from './actions'
import { useRouter } from 'next/navigation'

type Asset = {
    id: string
    name: string
    type: string
    identifier: string | null
    status: string
}

export default function AssetManager({ eventId, assets }: { eventId: string; assets: Asset[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        identifier: '',
        status: 'available',
    })

    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            identifier: '',
            status: 'available',
        })
        setEditingId(null)
        setIsAdding(false)
    }

    const handleEdit = (asset: Asset) => {
        setFormData({
            name: asset.name,
            type: asset.type,
            identifier: asset.identifier || '',
            status: asset.status,
        })
        setEditingId(asset.id)
        setIsAdding(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const data = new FormData()
        data.append('name', formData.name)
        data.append('type', formData.type)
        data.append('identifier', formData.identifier)
        data.append('status', formData.status)

        let res
        if (editingId) {
            res = await updateAsset(eventId, editingId, data)
        } else {
            res = await addAsset(eventId, data)
        }

        if (res?.error) {
            alert('Error saving asset: ' + res.error)
        } else {
            resetForm()
            router.refresh()
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure?')) return
        const res = await deleteAsset(eventId, id)
        if (res?.error) {
            alert('Error deleting asset: ' + res.error)
        } else {
            router.refresh()
        }
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assets Inventory</h2>
                <button
                    onClick={() => { resetForm(); setIsAdding(!isAdding); }}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    {isAdding ? 'Cancel' : 'Add Asset'}
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
                                placeholder="e.g. Motorola Radio"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            >
                                <option value="">Select Type</option>
                                <option value="Radio">Radio</option>
                                <option value="Vest">Vest</option>
                                <option value="Key">Key</option>
                                <option value="Tablet">Tablet</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Identifier / Serial #</label>
                            <input
                                type="text"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                placeholder="e.g. #001"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            >
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                {editingId ? 'Update Asset' : 'Save Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow transition-colors duration-200">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Identifier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{asset.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{asset.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{asset.identifier || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${asset.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            asset.status === 'assigned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {assets.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No assets found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
