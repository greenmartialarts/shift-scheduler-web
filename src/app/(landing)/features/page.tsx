import { Zap, Users, Calendar, BarChart3, Clock, ShieldCheck, Database, Search, Moon } from "lucide-react";

const featureGroups = [
    {
        title: "Scheduling & Logic",
        features: [
            {
                name: "Shift Assignment",
                description: "Fills open shifts based on volunteer availability. Replaces manual data entry and cross-referencing.",
                icon: <Zap className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            },
            {
                name: "Overlap Prevention",
                description: "Flags if a volunteer is assigned to two locations at once. Prevents scheduling gaps on event day.",
                icon: <ShieldCheck className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            },
            {
                name: "Volunteer Reassignment",
                description: "Move volunteers between shifts instantly when someone fails to show up.",
                icon: <Users className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            }
        ]
    },
    {
        title: "Operations & Attendance",
        features: [
            {
                name: "Volunteer Check-In",
                description: "Mark attendance from any device. Flag volunteers who haven't arrived 15 minutes before their shift.",
                icon: <Clock className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            },
            {
                name: "Data Import",
                description: "Upload volunteer names and contact info from existing CSV files. Matches column headers automatically.",
                icon: <Database className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            },
            {
                name: "Resource Lookup",
                description: "Central dashboard to find volunteers by name or shift location. Real-time filtering across all modules.",
                icon: <Search className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            }
        ]
    },
    {
        title: "Reporting & Support",
        features: [
            {
                name: "Shift Reporting",
                description: "Export attendance records and volunteer hours to CSV. Generate PDF summaries for event wrap-ups.",
                icon: <BarChart3 className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            },
            {
                name: "Mobile Support",
                description: "Interface designed for tablets and phones during the event. High-contrast layout for readable data.",
                icon: <Moon className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            },
            {
                name: "Custom Labels",
                description: "Assign names to shifts like 'Front Gate' or 'Security' for clear reporting and on-site check-in.",
                icon: <Calendar className="h-6 w-6" />,
                color: "text-blue-600 dark:text-blue-400"
            }
        ]
    }
];

export default function FeaturesPage() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center mb-24">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">System Capability</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                        A toolkit for shift coordination
                    </p>
                    <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                        Designed for event operators who need reliable attendance tracking and scheduling without manual spreadsheets.
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
                                    <div key={feature.name} className="flex flex-col items-start">
                                        <div className={`mb-6 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/30 ${feature.color}`}>
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
