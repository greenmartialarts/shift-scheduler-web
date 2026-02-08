'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-8">
                    <FileQuestion className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>

                <h1 className="text-6xl font-black text-zinc-900 dark:text-zinc-50 mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    Page Not Found
                </h2>

                <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}
