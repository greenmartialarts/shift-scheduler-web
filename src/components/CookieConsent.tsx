'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            const timer = setTimeout(() => {
                setShowBanner(true)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [])

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setShowBanner(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
            <div className="mx-auto max-w-4xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                            Cookie Notice
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            We use essential cookies to keep you logged in and ensure the site functions properly.
                            By continuing to use this site, you consent to our use of cookies.{' '}
                            <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Learn more
                            </a>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={acceptCookies}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={acceptCookies}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
