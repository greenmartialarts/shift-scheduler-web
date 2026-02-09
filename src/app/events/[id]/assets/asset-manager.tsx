'use client'

import { useState, useMemo } from 'react'
import { addAsset, deleteAsset, updateAsset } from './actions'
import { useNotification } from '@/components/ui/NotificationProvider'
import { useRouter } from 'next/navigation'
import {
    Package,
    Plus,
    X,
    Search,
    Trash2,
    Edit2,
    CheckCircle2,
    AlertCircle,
    Clock,
    HelpCircle,
    HardHat,
    Radio,
    Tablet,
    Key as KeyIcon
} from 'lucide-react'

type Asset = {
    id: string
    name: string
    type: string
    identifier: string | null
    status: string
}

const ASSET_TYPES = [
    { label: 'Radio', value: 'Radio', icon: <Radio className="w-4 h-4" /> },
    { label: 'Vest', value: 'Vest', icon: <HardHat className="w-4 h-4" /> },
    { label: 'Key', value: 'Key', icon: <KeyIcon className="w-4 h-4" /> },
    { label: 'Tablet', value: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { label: 'Other', value: 'Other', icon: <HelpCircle className="w-4 h-4" /> },
]

const STATUS_CONFIG = {
    available: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    assigned: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
    maintenance: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: <AlertCircle className="w-3 h-3" /> },
    lost: { color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: <X className="w-3 h-3" /> },
}

export default function AssetManager({ eventId, assets }: { eventId: string; assets: Asset[] }) {
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const { showAlert, showConfirm } = useNotification()

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        identifier: '',
        status: 'available',
    })

    const filteredAssets = useMemo(() => {
        return assets.filter(asset =>
            asset.name.toLowerCase().includes(search.toLowerCase()) ||
            asset.type.toLowerCase().includes(search.toLowerCase()) ||
            (asset.identifier && asset.identifier.toLowerCase().includes(search.toLowerCase()))
        )
    }, [assets, search])

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
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
            showAlert('Error saving asset: ' + res.error, 'error')
        } else {
            router.refresh()
            resetForm()
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await showConfirm({
            title: 'Delete Asset',
            message: 'Are you sure you want to delete this asset? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteAsset(eventId, id)
        if (res?.error) {
            showAlert('Error deleting asset: ' + res.error, 'error')
        } else {
            router.refresh()
        }
    }

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search inventory by name, type, or serial..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-50 outline-none transition-all placeholder:text-zinc-400 font-medium"
                    />
                </div>
                <button
                    onClick={() => { resetForm(); setIsAdding(!isAdding); }}
                    className="button-premium w-full md:w-auto px-6 py-3.5"
                >
                    {isAdding ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    {isAdding ? 'Cancel' : 'Add Asset'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="premium-card p-8 border-blue-500/20 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
                        {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                        {editingId ? 'Modify Inventory Record' : 'Register New Asset'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Motorola CP200"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Equipment Category</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                            >
                                <option value="">Select Category</option>
                                {ASSET_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Internal Identifier</label>
                            <input
                                type="text"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                placeholder="e.g. RAD-001"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Operational Status</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Object.keys(STATUS_CONFIG).map((status) => (
                                    <label key={status} className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status}
                                            checked={formData.status === status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="peer sr-only"
                                        />
                                        <div className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white transition-all text-[10px] font-black uppercase text-center text-zinc-500">
                                            {status}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 lg:col-span-2 flex items-end justify-end">
                            <button
                                type="submit"
                                className="button-premium px-8 w-full sm:w-auto"
                            >
                                {editingId ? 'Sync Updates' : 'Confirm Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Inventory Table */}
            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Asset Name</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Category</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Identifier</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Status</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredAssets.map((asset) => (
                                <tr key={asset.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-zinc-900 dark:text-zinc-50">{asset.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            {ASSET_TYPES.find(t => t.value === asset.type)?.icon}
                                            <span>{asset.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                            {asset.identifier || 'NO-ID'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${STATUS_CONFIG[asset.status as keyof typeof STATUS_CONFIG]?.color || ''}`}>
                                            {STATUS_CONFIG[asset.status as keyof typeof STATUS_CONFIG]?.icon}
                                            <span>{asset.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(asset)}
                                                className="p-2 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                                title="Edit Asset"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(asset.id)}
                                                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                title="Delete Asset"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAssets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                                            <Search className="w-10 h-10 opacity-20" />
                                            <p className="font-bold italic">No equipment located in inventory.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

