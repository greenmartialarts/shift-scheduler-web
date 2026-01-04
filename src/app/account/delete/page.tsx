'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount } from './actions'
import { AlertTriangle, Loader2 } from 'lucide-react'

export default function DeleteAccountPage() {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm')
            return
        }

        setIsDeleting(true)
        setError('')

        const result = await deleteAccount()

        if (result?.error) {
            setError(result.error)
            setIsDeleting(false)
        }
        // If successful, redirect happens automatically
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="premium-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                            Delete Account
                        </h1>
                    </div>

                    {!showConfirm ? (
                        <div className="space-y-6">
                            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                                <p className="font-bold text-red-600 dark:text-red-400">
                                    Warning: This action cannot be undone!
                                </p>
                                <p>
                                    Deleting your account will permanently remove:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>All your events</li>
                                    <li>All volunteers</li>
                                    <li>All shifts and assignments</li>
                                    <li>All asset records</li>
                                    <li>All check-in data</li>
                                </ul>
                                <p className="pt-4">
                                    Your data will be permanently deleted within 30 days.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => router.back()}
                                    className="flex-1 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                <p className="mb-4">
                                    Type <span className="font-mono font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm account deletion:
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono"
                                    placeholder="DELETE"
                                    autoFocus
                                    disabled={isDeleting}
                                />
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirm(false)
                                        setConfirmText('')
                                        setError('')
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting || confirmText !== 'DELETE'}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete My Account'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
