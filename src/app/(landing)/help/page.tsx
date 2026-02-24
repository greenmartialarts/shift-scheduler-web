import Link from "next/link";
import { Search, Book, Bug, Lightbulb, ArrowRight, ChevronRight } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">System Documentation</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                        Resource Center
                    </p>
                    <div className="mt-10 relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 max-w-4xl mx-auto">
                    {[
                        {
                            title: "Operational Guide",
                            description: "Learn the fundamentals of event setup, shift assignment, and volunteer onboarding.",
                            icon: <Book className="h-6 w-6 text-blue-600" />,
                            link: "#"
                        },
                        {
                            title: "Bug Reporting",
                            description: "Submit technical issues or data discrepancies directly to the operations team.",
                            icon: <Bug className="h-6 w-6 text-zinc-600" />,
                            link: "/contact"
                        }
                    ].map((item) => (
                        <Link
                            key={item.title}
                            href={item.link}
                            className="group p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors hover:border-blue-600/30"
                        >
                            <div className="mb-6 h-12 w-12 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">{item.icon}</div>
                            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">{item.description}</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-500">
                                View Documentation <ArrowRight className="h-4 w-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Categories */}
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Lightbulb className="h-6 w-6 text-amber-500" />
                            Help Articles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 divide-y md:divide-y-0 divide-zinc-100 dark:divide-zinc-800">
                            {[
                                { title: "How to bulk import volunteers from CSV", slug: "bulk-import-csv" },
                                { title: "Setting up automated shift reminders", slug: "automated-shift-reminders" },
                                { title: "Customizing check-in kiosk settings", slug: "check-in-kiosk-settings" },
                                { title: "Managing administrator permissions", slug: "admin-permissions" },
                                { title: "Exporting attendance reports for payroll", slug: "attendance-reports-payroll" },
                                { title: "Troubleshooting email delivery issues", slug: "email-delivery-issues" },
                                { title: "Handling overlapping volunteer shifts", slug: "overlapping-shifts" },
                                { title: "Printing daily volunteer schedules", slug: "daily-volunteer-schedules" },
                                { title: "Configuring custom shift names", slug: "custom-shift-names" },
                                { title: "Resetting administrator passwords", slug: "resetting-admin-passwords" },
                                { title: "Interpreting performance analytics", slug: "performance-analytics" },
                                { title: "Managing asset assignments in real-time", slug: "asset-assignments-real-time" }
                            ].map((article) => (
                                <Link
                                    key={article.slug}
                                    href={`/help/${article.slug}`}
                                    className="w-full flex items-center justify-between py-4 group text-left transition-colors border-b border-zinc-100 dark:border-zinc-800"
                                >
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-500">{article.title}</span>
                                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
