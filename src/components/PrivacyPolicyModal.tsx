'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function PrivacyPolicyModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
                Privacy Policy
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                                Privacy Policy
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Data We Collect
                                </h3>
                                <p>
                                    We collect only the information necessary to provide our volunteer scheduling service:
                                </p>
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>Email address (for account authentication)</li>
                                    <li>Volunteer names and group assignments</li>
                                    <li>Shift schedules and assignments</li>
                                    <li>Check-in/check-out timestamps</li>
                                    <li>Asset assignment records</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    How We Use Your Data
                                </h3>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>To provide event management and volunteer scheduling services</li>
                                    <li>To enable organizers to manage their events</li>
                                    <li>To facilitate check-in and asset tracking</li>
                                    <li>To generate reports and analytics for event organizers</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Data Storage & Security
                                </h3>
                                <p>
                                    Your data is securely stored using Supabase, a SOC 2 Type II certified platform.
                                    All data is encrypted in transit (HTTPS) and at rest. We implement Row-Level Security
                                    policies to ensure users can only access their own events and data.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Cookies
                                </h3>
                                <p>
                                    We use essential cookies to maintain your login session and ensure the site functions
                                    properly. These cookies are necessary for the service to work and cannot be disabled.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Your Rights
                                </h3>
                                <p>You have the right to:</p>
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>Access your personal data</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your account and associated data</li>
                                    <li>Export your data</li>
                                </ul>
                                <p className="mt-2">
                                    To exercise these rights, visit your account settings or contact support.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Data Retention
                                </h3>
                                <p>
                                    We retain your data for as long as your account is active. When you delete your account,
                                    all associated data (events, volunteers, shifts, assignments) will be permanently deleted
                                    within 30 days.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Third-Party Services
                                </h3>
                                <p>
                                    We use the following third-party services:
                                </p>
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li><strong>Supabase:</strong> Database and authentication</li>
                                    <li><strong>Railway:</strong> Auto-assignment API</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Changes to This Policy
                                </h3>
                                <p>
                                    We may update this privacy policy from time to time. We will notify you of any
                                    significant changes by email or through the application.
                                </p>
                            </section>

                            <section className="text-xs text-zinc-500 dark:text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <p>Last updated: December 30, 2025</p>
                            </section>
                        </div>

                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
