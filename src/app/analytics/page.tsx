'use client'

import { useState, useEffect } from 'react'
import { Analytics } from '@/lib/analytics'
import { ErrorLogger } from '@/lib/errorLogger'
import { BarChart3, Activity, AlertTriangle, Download, Trash2, Eye, EyeOff, Lock } from 'lucide-react'

// Using environment variable for analytics access
const PASSWORD_HASH = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD_HASH

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AnalyticsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [pageViews, setPageViews] = useState<ReturnType<typeof Analytics.getPageViews>>([])
    const [events, setEvents] = useState<ReturnType<typeof Analytics.getEvents>>([])
    const [errorLogs, setErrorLogs] = useState<ReturnType<typeof ErrorLogger.getErrors>>([])

    const loadData = () => {
        setPageViews(Analytics.getPageViews())
        setEvents(Analytics.getEvents())
        setErrorLogs(ErrorLogger.getErrors())
    }

    useEffect(() => {
        // Check if already authenticated in this session
        const auth = sessionStorage.getItem('analytics_auth')
        if (auth === 'true') {
            // Use setTimeout to avoid cascading renders
            setTimeout(() => {
                setIsAuthenticated(true)
                loadData()
            }, 0)
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!PASSWORD_HASH) {
            setError('Analytics access is not configured. Please set NEXT_PUBLIC_ANALYTICS_PASSWORD_HASH.')
            return
        }

        const hash = await hashPassword(password)
        if (hash === PASSWORD_HASH) {
            setIsAuthenticated(true)
            sessionStorage.setItem('analytics_auth', 'true')
            loadData()
        } else {
            setError('Incorrect password')
            setPassword('')
        }
    }

    const handleExport = () => {
        const data = Analytics.exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-export-${new Date().toISOString()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleClearAnalytics = () => {
        if (confirm('Are you sure you want to clear all analytics data?')) {
            Analytics.clearAll()
            loadData()
        }
    }

    const handleClearErrors = () => {
        if (confirm('Are you sure you want to clear all error logs?')) {
            ErrorLogger.clearErrors()
            loadData()
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/20 mb-4">
                                <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-2">
                                Analytics Dashboard
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Enter password to access analytics
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                                        placeholder="Enter password"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Access Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-2">
                        Analytics Dashboard
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        View application analytics and error logs
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Page Views</h3>
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{pageViews.length}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Events</h3>
                            <Activity className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{events.length}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Errors</h3>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{errorLogs.length}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button
                        onClick={handleClearAnalytics}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold rounded-xl transition-colors text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Analytics
                    </button>
                    <button
                        onClick={handleClearErrors}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Errors
                    </button>
                </div>

                {/* Page Views */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">Page Views</h2>
                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Path</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Referrer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {pageViews.slice(0, 50).map((view) => (
                                        <tr key={view.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                                                {new Date(view.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                {view.path}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                                                {view.referrer || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {pageViews.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 italic">
                                                No page views recorded yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Events */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">Events</h2>
                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Event Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Path</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {events.slice(0, 50).map((event) => (
                                        <tr key={event.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                {event.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                                {event.path}
                                            </td>
                                        </tr>
                                    ))}
                                    {events.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 italic">
                                                No events recorded yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Error Logs */}
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4">Error Logs</h2>
                    <div className="space-y-4">
                        {errorLogs.slice(0, 20).map((error) => (
                            <div key={error.id} className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        <h3 className="font-bold text-red-900 dark:text-red-100">{error.message}</h3>
                                    </div>
                                    <span className="text-xs font-mono text-red-600 dark:text-red-400">
                                        {new Date(error.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                {error.stack && (
                                    <pre className="text-xs font-mono text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg overflow-x-auto">
                                        {error.stack}
                                    </pre>
                                )}
                                <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                                    <p><strong>URL:</strong> {error.url}</p>
                                </div>
                            </div>
                        ))}
                        {errorLogs.length === 0 && (
                            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
                                <p className="text-zinc-400 italic">No errors recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
