'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@/lib/analytics'

export function AnalyticsTracker() {
    const pathname = usePathname()

    useEffect(() => {
        // Track page view on mount and route change
        Analytics.trackPageView(pathname)
    }, [pathname])

    return null
}
