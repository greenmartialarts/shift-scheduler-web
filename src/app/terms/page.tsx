import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfServicePage() {
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
                        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
                            Terms of Service
                        </h1>
                    </div>

                    <div className="space-y-8 text-zinc-600 dark:text-zinc-400">
                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                1. Acceptance of Terms
                            </h2>
                            <p>
                                By accessing and using Volunteer Scheduler, you agree to be bound by these Terms of Service
                                and all applicable laws and regulations. If you do not agree with any of these terms,
                                you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                2. Use License
                            </h2>
                            <p className="mb-4">
                                Permission is granted to temporarily use Volunteer Scheduler for personal or organizational
                                volunteer management purposes. This is the grant of a license, not a transfer of title, and
                                under this license you may not:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>Modify or copy the materials;</li>
                                <li>Use the materials for any commercial purpose without explicit authorization;</li>
                                <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
                                <li>Remove any copyright or other proprietary notations from the materials.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                3. Disclaimer
                            </h2>
                            <p>
                                The materials on Volunteer Scheduler are provided on an &apos;as is&apos; basis. We make no warranties,
                                expressed or implied, and hereby disclaim and negate all other warranties including, without
                                limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
                                or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                4. Limitations
                            </h2>
                            <p>
                                In no event shall Volunteer Scheduler or its suppliers be liable for any damages (including,
                                without limitation, damages for loss of data or profit, or due to business interruption)
                                arising out of the use or inability to use the materials on Volunteer Scheduler.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                5. Accuracy of Materials
                            </h2>
                            <p>
                                The materials appearing on Volunteer Scheduler could include technical, typographical, or
                                photographic errors. We do not warrant that any of the materials on its website are accurate,
                                complete or current. We may make changes to the materials contained on its website at any time
                                without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                6. Links
                            </h2>
                            <p>
                                Volunteer Scheduler has not reviewed all of the sites linked to its website and is not
                                responsible for the contents of any such linked site. The inclusion of any link does not
                                imply endorsement by Volunteer Scheduler of the site. Use of any such linked website is at
                                the user&apos;s own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                7. Modifications
                            </h2>
                            <p>
                                We may revise these terms of service for its website at any time without notice. By using
                                this website you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </section>

                        <section className="text-sm text-zinc-500 dark:text-zinc-500 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <p>Last updated: February 8, 2026</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
