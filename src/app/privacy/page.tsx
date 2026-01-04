import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 mb-8 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <div className="premium-card p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
                            Privacy Policy
                        </h1>
                    </div>

                    <div className="space-y-8 text-zinc-600 dark:text-zinc-400">
                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Data We Collect
                            </h2>
                            <p className="mb-4">
                                We collect only the information necessary to provide our volunteer scheduling service:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>Email address (for account authentication)</li>
                                <li>Volunteer names and group assignments</li>
                                <li>Shift schedules and assignments</li>
                                <li>Check-in/check-out timestamps</li>
                                <li>Asset assignment records</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                How We Use Your Data
                            </h2>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>To provide event management and volunteer scheduling services</li>
                                <li>To enable organizers to manage their events</li>
                                <li>To facilitate check-in and asset tracking</li>
                                <li>To generate reports and analytics for event organizers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Data Storage & Security
                            </h2>
                            <p>
                                Your data is securely stored using Supabase, a SOC 2 Type II certified platform.
                                All data is encrypted in transit (HTTPS) and at rest. We implement Row-Level Security
                                policies to ensure users can only access their own events and data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Cookies
                            </h2>
                            <p>
                                We use essential cookies to maintain your login session and ensure the site functions
                                properly. These cookies are necessary for the service to work and cannot be disabled.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Your Rights
                            </h2>
                            <p className="mb-4">You have the right to:</p>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your account and associated data</li>
                                <li>Export your data</li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, visit your account settings or contact support.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Data Retention
                            </h2>
                            <p>
                                We retain your data for as long as your account is active. When you delete your account,
                                all associated data (events, volunteers, shifts, assignments) will be permanently deleted
                                within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Third-Party Services
                            </h2>
                            <p className="mb-4">We use the following third-party services:</p>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li><strong>Supabase:</strong> Database and authentication</li>
                                <li><strong>Railway:</strong> Auto-assignment API</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                Changes to This Policy
                            </h2>
                            <p>
                                We may update this privacy policy from time to time. We will notify you of any
                                significant changes by email or through the application.
                            </p>
                        </section>

                        <section className="text-sm text-zinc-500 dark:text-zinc-500 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <p>Last updated: December 30, 2025</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
