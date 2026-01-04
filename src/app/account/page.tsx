'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { UserCircle, Trash2, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AccountSettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push('/login')
                return
            }

            setUser(user)
            setLoading(false)
        }

        loadUser()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-2">
                        Account Settings
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Manage your account and privacy settings
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                                <UserCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                Profile Information
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-600 dark:text-zinc-400">Email:</span>
                                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                                    {user?.email}
                                </span>
                            </div>
                            <div className="pt-3 text-xs text-zinc-500 dark:text-zinc-400">
                                <p>Joined: {new Date(user?.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
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
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
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
