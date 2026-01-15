'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global error:', error)
    }, [error])

    return (
        <html>
            <body>
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full">
                        <div className="bg-red-900/20 border-2 border-red-800 rounded-3xl p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>

                            <h1 className="text-2xl font-black text-white mb-3">
                                Critical Error
                            </h1>

                            <p className="text-sm text-zinc-400 mb-6">
                                A critical error occurred. Please try refreshing the page.
                            </p>

                            <button
                                onClick={reset}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
