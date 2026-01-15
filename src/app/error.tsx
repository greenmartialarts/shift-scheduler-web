'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to console
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-3">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            We encountered an unexpected error while processing your request.
                        </p>

                        {error.message && (
                            <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-800">
                                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                                    {error.message}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={reset}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <Link
                            href="/events"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold rounded-xl transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </Link>
                    </div>

                    <p className="text-xs text-center text-zinc-400 mt-6">
                        If this problem persists, please contact support or check the browser console for more details.
                    </p>
                </div>
            </div>
        </div>
    )
}
