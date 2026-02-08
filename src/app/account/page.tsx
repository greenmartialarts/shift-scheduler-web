'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { UserCircle, Trash2, Mail, ArrowLeft, Lock, KeyRound, Sparkles } from 'lucide-react'
import { useTutorial } from '@/components/tutorial/TutorialContext'
import { useNotification } from '@/components/ui/NotificationProvider'
import { PremiumButton } from '@/components/ui/PremiumButton'
import Link from 'next/link'

import { type User } from '@supabase/supabase-js'

export default function AccountSettingsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [timezone, setTimezone] = useState<'local' | 'event'>('local')

    const router = useRouter()
    const { startTutorial } = useTutorial()
    const { showAlert } = useNotification()

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push('/login')
                return
            }

            setUser(user)
            setDisplayName(user.user_metadata?.full_name || '')
            setTimezone(user.user_metadata?.timezone_preference || 'local')
            setLoading(false)
        }

        loadUser()
    }, [router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: displayName,
                    timezone_preference: timezone
                }
            })

            if (error) throw error
            window.location.reload()
        } catch (error) {
            console.error('Error updating profile:', error)
            showAlert('Failed to update profile', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 mb-8 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Account Settings
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Manage your profile and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Editable Profile Form */}
                    <form onSubmit={handleUpdateProfile} className="premium-card p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <UserCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                Profile & Preferences
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Display Name
                                </label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Jane Doe"
                                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-400"
                                />
                                <p className="text-xs text-zinc-500">
                                    This name will be visible to other members in your events.
                                </p>
                            </div>

                            {/* Email (Read Only) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm cursor-not-allowed">
                                    <Mail className="w-4 h-4" />
                                    {user?.email}
                                </div>
                            </div>

                            {/* Timezone Preference */}
                            <div className="space-y-3 pt-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Timezone Display
                                </label>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTimezone('local')}
                                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all ${timezone === 'local'
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timezone === 'local' ? 'border-blue-600' : 'border-zinc-400'}`}>
                                            {timezone === 'local' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                        </div>
                                        <span>Device Local Time</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTimezone('event')}
                                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all ${timezone === 'event'
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timezone === 'event' ? 'border-blue-600' : 'border-zinc-400'}`}>
                                            {timezone === 'event' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                        </div>
                                        <span>Event Timezone</span>
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Choose whether to see shift times in your local time or the event&apos;s timezone.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <PremiumButton
                                type="submit"
                                disabled={saving}
                                className={saving ? 'opacity-70 cursor-wait' : ''}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </PremiumButton>
                        </div>
                    </form>

                    {/* Security Section - Only for Email/Password Users */}
                    {user?.app_metadata?.provider === 'email' && (
                        <div className="premium-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                    <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    Security
                                </h2>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Update your password to keep your account secure.
                            </p>
                            <Link
                                href="/forgot-password"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold transition-colors"
                            >
                                <KeyRound className="w-4 h-4" />
                                Reset Password
                            </Link>
                        </div>
                    )}

                    {/* Tutorial Section */}
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                Tutorial
                            </h2>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Restart the onboarding tour to learn how to use the application.
                        </p>
                        <button
                            onClick={() => {
                                startTutorial()
                                router.push('/events')
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            Replay Tutorial
                        </button>
                    </div>

                    {/* Privacy Section */}
                    <div className="premium-card p-6">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                            Privacy & Data
                        </h2>
                        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <p>
                                We take your privacy seriously. All your data is encrypted and protected by industry-standard security measures.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <Link
                                    href="/privacy"
                                    className="text-blue-600 dark:text-blue-500 hover:underline font-medium"
                                >
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="premium-card p-6 border-red-200 dark:border-red-900/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                                Danger Zone
                            </h2>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Link
                            href="/account/delete"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
