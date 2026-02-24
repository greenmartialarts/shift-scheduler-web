import { Users, Heart, Globe, Sparkles } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="py-24 sm:py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Story Section */}
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl mb-8">
                                Management for event operations
                            </h1>
                            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
                                A tool for centralizing volunteer data and shift schedules.
                            </p>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
                                Developed to address the overhead of manual staffing, our platform provides a system for tracking attendance and assigning shifts across large-scale events. We focus on operational data integrity and high-contrast accessibility for use in on-site environments.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {[
                                    { label: "Founded", value: "2025", icon: <Calendar className="h-5 w-5 text-blue-600" /> },
                                    { label: "Uptime", value: "99.9%", icon: <Heart className="h-5 w-5 text-blue-600" /> },
                                    { label: "Support", value: "Community", icon: <Globe className="h-5 w-5 text-blue-600" /> }
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</div>
                                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">{stat.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hidden lg:block relative">
                            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 aspect-square flex items-center justify-center p-12 overflow-hidden shadow-sm">
                                <div className="text-center">
                                    <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-8" />
                                    <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 font-mono tracking-tight uppercase">Operational Goal</h2>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-sm">Replace manual data processing with a standard system for event staffing and attendance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mt-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Accessibility",
                                description: "Designed for high readability on-site. Usable in variable lighting and on multiple device types.",
                                icon: <Users className="h-6 w-6 text-blue-600" />
                            },
                            {
                                title: "Performance",
                                description: "Optimized for speed. Search, fill schedules, and export data with low latency.",
                                icon: <Sparkles className="h-6 w-6 text-blue-600" />
                            },
                            {
                                title: "Reliability",
                                description: "A stable foundation for real-time check-ins and staffing reports.",
                                icon: <ShieldCheck className="h-6 w-6 text-blue-600" />
                            }
                        ].map((value) => (
                            <div key={value.title} className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="mb-6 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">{value.icon}</div>
                                <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{value.title}</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Inline imports to avoid missing component errors while building
function Calendar({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}
