import Link from "next/link";
import { Search, Book, Bug, Lightbulb, ArrowRight, ChevronRight } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Support Center</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
                        Knowledge <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">at your fingertips</span>
                    </p>
                    <div className="mt-10 relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search for help articles..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 max-w-4xl mx-auto">
                    {[
                        {
                            title: "Getting Started",
                            description: "New to the platform? Learn the basics of creating your first event and adding volunteers.",
                            icon: <Book className="h-8 w-8 text-blue-500" />,
                            link: "#"
                        },
                        {
                            title: "Bug Report",
                            description: "Found an issue? Let our engineering team know immediately so we can fix it.",
                            icon: <Bug className="h-8 w-8 text-rose-500" />,
                            link: "/contact"
                        }
                    ].map((item) => (
                        <Link
                            key={item.title}
                            href={item.link}
                            className="group p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <div className="mb-6">{item.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{item.description}</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                                    className="w-full flex items-center justify-between py-5 group text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-b border-zinc-100 dark:border-zinc-800 md:border-b"
                                >
                                    <span className="font-medium text-lg leading-snug">{article.title}</span>
                                    <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-indigo-500" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
