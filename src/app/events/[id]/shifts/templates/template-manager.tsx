'use client'

import { useState } from 'react'
import { addTemplate, deleteTemplate } from './actions'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/NotificationProvider'

type Template = {
    id: string
    name: string
    description: string | null
    duration_hours: number
    required_groups: any
    allowed_groups: string[] | null
}

export default function TemplateManager({ templates }: { templates: Template[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const router = useRouter()
    const { showAlert, showConfirm } = useNotification()

    async function handleAdd(formData: FormData) {
        const res = await addTemplate(formData)
        if (res?.error) {
            showAlert('Error adding template: ' + res.error, 'error')
        } else {
            showAlert('Template created successfully', 'success')
            setIsAdding(false)
            router.refresh()
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await showConfirm({
            title: 'Delete Template',
            message: 'Are you sure you want to delete this template?',
            confirmText: 'Delete',
            type: 'danger'
        })
        if (!confirmed) return
        const res = await deleteTemplate(id)
        if (res?.error) {
            showAlert('Error deleting template: ' + res.error, 'error')
        } else {
            showAlert('Template deleted successfully', 'success')
            router.refresh()
        }
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shift Templates</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {isAdding ? 'Cancel' : 'Add Template'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                    <form action={handleAdd} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Template Name"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Hours)</label>
                            <input
                                type="number"
                                name="duration_hours"
                                required
                                step="0.5"
                                placeholder="2.5"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                name="description"
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Required Groups (JSON: e.g. {'{"Delegates": 1}'})
                            </label>
                            <input
                                type="text"
                                name="required_groups"
                                placeholder='{"Delegates": 1}'
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allowed Groups (JSON Array: e.g. ["Delegates"])
                            </label>
                            <input
                                type="text"
                                name="allowed_groups"
                                placeholder='["Delegates"]'
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Save Template
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <div key={template.id} className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                            <button
                                onClick={() => handleDelete(template.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Delete
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <p>Duration: {template.duration_hours} hours</p>
                            <p>Requirements: {JSON.stringify(template.required_groups)}</p>
                        </div>
                    </div>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                        No templates found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}
