'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
    Users,
    Calendar,
    LayoutDashboard,
    Settings,
    UserCheck,
    FileBarChart,
    Zap,
    ChevronLeft,
    Package,
    ClipboardList
} from 'lucide-react'
import { motion } from 'framer-motion'
export function EventSidebar() {
    const params = useParams()
    const pathname = usePathname()
    const id = params.id as string

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: `/events/${id}` },
        { name: 'Admin Center', icon: Zap, href: `/events/${id}/active` },
        { name: 'Volunteers', icon: Users, href: `/events/${id}/volunteers` },
        { name: 'Shifts', icon: Calendar, href: `/events/${id}/shifts` },
        { name: 'Assets', icon: Package, href: `/events/${id}/assets` },
        { name: 'Assignments', icon: Zap, href: `/events/${id}/assign` },
        { name: 'Check-in', icon: UserCheck, href: `/events/${id}/checkin` },
        { name: 'Reports', icon: FileBarChart, href: `/events/${id}/reports` },
        { name: 'Audit Log', icon: ClipboardList, href: `/events/${id}/audit` },
        { name: 'Settings', icon: Settings, href: `/events/${id}/share` },
    ]

    return (
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-8 bg-zinc-50/50 dark:bg-zinc-900/10 backdrop-blur-xl h-full overflow-y-auto">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="text-white font-bold">V</span>
                </div>
                <span className="font-black tracking-tight text-zinc-900 dark:text-zinc-50">Hub</span>
            </div>

            <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                    const isOverview = item.name === 'Overview'
                    const isVolunteersSection = item.name === 'Volunteers' && (pathname.endsWith('/volunteers') || pathname.endsWith('/groups'))
                    const isShiftsSection = item.name === 'Shifts' && (pathname.includes('/shifts'))

                    const isActive = isOverview
                        ? pathname === item.href
                        : (isVolunteersSection || isShiftsSection || pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                            {item.name}
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-indigo-600 rounded-xl -z-10"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                    id="back-to-events-link"
                    href="/events"
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Back to Center
                </Link>
            </div>
        </aside>
    )
}
