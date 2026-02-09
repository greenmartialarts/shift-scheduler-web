'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
    Users,
    Calendar,
    LayoutDashboard,
    Settings,
    UserCheck,
    FileBarChart,
    Zap,
    ChevronLeft,
    ChevronRight,
    Package,
    ClipboardList,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function EventSidebar() {
    const params = useParams()
    const pathname = usePathname()
    const id = params.id as string
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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
        <motion.aside
            initial={false}
            animate={{
                width: isMobile ? '100%' : (isCollapsed ? 80 : 256),
                height: isMobile ? 'auto' : '100%'
            }}
            style={{ overflow: 'visible' }}
            className="group/sidebar relative border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 backdrop-blur-xl h-full min-h-[60px] md:min-h-screen transition-colors duration-300 z-40"
        >
            {/* Collapse Toggle - Optimized for visibility and hit target */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex absolute -right-4 top-12 h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 shadow-xl z-50 transition-all hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-black/5"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            {/* Inner Scrollable Container */}
            <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-8">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold">V</span>
                    </div>
                    <AnimatePresence initial={false}>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-black tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap"
                            >
                                Hub
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
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
                                title={isCollapsed ? item.name : undefined}
                                className={`group flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all relative ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />

                                <AnimatePresence initial={false}>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Section */}
                <div className={`mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 px-2`}>
                    <Link
                        id="back-to-events-link"
                        href="/events"
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                Back to Center
                            </motion.span>
                        )}
                    </Link>
                </div>
            </div>
        </motion.aside>
    )
}
