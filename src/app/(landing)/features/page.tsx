import { Zap, Users, Calendar, BarChart3, Clock, ShieldCheck, Database, Search, Moon } from "lucide-react";

const featureGroups = [
    {
        title: "Scheduling Intelligence",
        features: [
            {
                name: "Auto-Assign Optimization",
                description: "Our proprietary algorithm fills even the most complex schedules in seconds, prioritizing volunteer preferences and historical data.",
                icon: <Zap className="h-6 w-6" />,
                color: "bg-indigo-500"
            },
            {
                name: "Conflict Detection",
                description: "Never double-book again. Intelligent warnings highlight overlapping shifts and volunteer unavailability in real-time.",
                icon: <ShieldCheck className="h-6 w-6" />,
                color: "bg-purple-500"
            },
            {
                name: "Shift Swapping",
                description: "Empower your volunteers with a one-click swap interface. Approvals are optional, giving your team flexibility.",
                icon: <Users className="h-6 w-6" />,
                color: "bg-pink-500"
            }
        ]
    },
    {
        title: "Operational Excellence",
        features: [
            {
                name: "Real-time Check-ins",
                description: "Track attendance as it happens. Mobile-optimized check-in stations for your staff or self-service kiosks.",
                icon: <Clock className="h-6 w-6" />,
                color: "bg-emerald-500"
            },
            {
                name: "Bulk CSV Integration",
                description: "Migrate from spreadsheets in minutes. Our smart importer handles diverse formats and validates data on the fly.",
                icon: <Database className="h-6 w-6" />,
                color: "bg-blue-500"
            },
            {
                name: "Advanced Command Center",
                description: "A centralized hub to monitor your entire event. Search, filter, and modify data across all modules efficiently.",
                icon: <Search className="h-6 w-6" />,
                color: "bg-amber-500"
            }
        ]
    },
    {
        title: "Insights & Experience",
        features: [
            {
                name: "Deep Analytics",
                description: "Export comprehensive reports in CSV or PDF. Track hour totals, attendance rates, and team performance metrics.",
                icon: <BarChart3 className="h-6 w-6" />,
                color: "bg-rose-500"
            },
            {
                name: "Adaptive Interface",
                description: "A beautiful, premium UI designed for focus. Full dark mode support reduces eye strain for long sessions.",
                icon: <Moon className="h-6 w-6" />,
                color: "bg-slate-500"
            },
            {
                name: "Custom Branding",
                description: "Add your organization's personality. Customizable shift names and communication templates for a professional feel.",
                icon: <Calendar className="h-6 w-6" />,
                color: "bg-indigo-600"
            }
        ]
    }
];

export default function FeaturesPage() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center mb-24">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Features</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
                        Everything you need for <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">professional coordination</span>
                    </p>
                    <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                        A built-for-purpose toolkit that turns chaos into coordinates. Scalable, fast, and remarkably easy to use.
                    </p>
                </div>

                <div className="space-y-32">
                    {featureGroups.map((group) => (
                        <div key={group.title} className="relative">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-800" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{group.title}</h3>
                                <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-800" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {group.features.map((feature) => (
                                    <div key={feature.name} className="group flex flex-col items-start">
                                        <div className={`mb-6 rounded-2xl p-4 text-white ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {feature.icon}
                                        </div>
                                        <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{feature.name}</h4>
                                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
