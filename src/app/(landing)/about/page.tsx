import { Users, Heart, Globe, Sparkles } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="py-24 sm:py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Story Section */}
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl mb-8">
                                Empowering the world&apos;s <br />
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">helpers</span>
                            </h1>
                            <p className="text-xl leading-8 text-zinc-600 dark:text-zinc-400 mb-6">
                                Volunteer Scheduler was born out of a simple observation: organizers spend 70% of their time on logistics and only 30% on mission. We&apos;re here to flip that ratio.
                            </p>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
                                What started as a tool for a local food bank has grown into a powerful platform used by thousands of organizations worldwide. Our mission is to make event coordination so seamless that the only thing you have to focus on is the impact you&apos;re making.
                            </p>

                            <div className="flex flex-wrap gap-6">
                                {[
                                    { label: "Founded", value: "2025", icon: <Calendar className="h-5 w-5 text-indigo-500" /> },
                                    { label: "Community First", value: "100%", icon: <Heart className="h-5 w-5 text-red-500" /> },
                                    { label: "Global Scope", value: "Everywhere", icon: <Globe className="h-5 w-5 text-blue-500" /> }
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
                                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl rounded-3xl" />
                            <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 aspect-square flex items-center justify-center p-12 overflow-hidden overflow-hidden">
                                <div className="text-center">
                                    <Sparkles className="h-24 w-24 text-indigo-500 mx-auto mb-8 animate-pulse" />
                                    <h2 className="text-3xl font-bold mb-4">Crafted for Impact</h2>
                                    <p className="text-zinc-500 italic max-w-sm">&quot;Code that schedules is code that serves. Every line we write is dedicated to the people who give their time back.&quot;</p>
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
                                title: "Inclusivity",
                                description: "We build tools that are accessible to everyone, regardless of technical literacy or budget.",
                                icon: <Users className="h-8 w-8 text-indigo-500" />
                            },
                            {
                                title: "Performance",
                                description: "Organizers need tools that keep up with them. We prioritize speed and reliability above all else.",
                                icon: <Sparkles className="h-8 w-8 text-amber-500" />
                            },
                            {
                                title: "Transparency",
                                description: "We are open about our process, our roadmap, and our commitment to data privacy.",
                                icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />
                            }
                        ].map((value) => (
                            <div key={value.title} className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-shadow duration-300">
                                <div className="mb-6">{value.icon}</div>
                                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
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
