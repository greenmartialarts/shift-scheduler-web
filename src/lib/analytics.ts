'use client'

/**
 * Free, self-hosted analytics utility
 * Tracks page views and events in localStorage
 */

interface PageView {
    id: string
    timestamp: string
    path: string
    referrer: string
    userAgent: string
}

interface Event {
    id: string
    timestamp: string
    name: string
    properties?: Record<string, unknown>
    path: string
}

const MAX_PAGE_VIEWS = 500
const MAX_EVENTS = 500
const PAGE_VIEWS_KEY = 'app_page_views'
const EVENTS_KEY = 'app_events'

export class Analytics {
    /**
     * Track a page view
     */
    static trackPageView(path?: string) {
        if (typeof window === 'undefined') return

        const pageView: PageView = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            path: path || window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent
        }

        this.storePageView(pageView)
    }

    /**
     * Track a custom event
     */
    static trackEvent(name: string, properties?: Record<string, unknown>) {
        if (typeof window === 'undefined') return

        const event: Event = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            name,
            properties,
            path: window.location.pathname
        }

        this.storeEvent(event)
    }

    private static storePageView(pageView: PageView) {
        try {
            const stored = localStorage.getItem(PAGE_VIEWS_KEY)
            const pageViews: PageView[] = stored ? JSON.parse(stored) : []

            pageViews.unshift(pageView)
            const trimmed = pageViews.slice(0, MAX_PAGE_VIEWS)

            localStorage.setItem(PAGE_VIEWS_KEY, JSON.stringify(trimmed))
        } catch (e) {
            console.warn('Failed to store page view:', e)
        }
    }

    private static storeEvent(event: Event) {
        try {
            const stored = localStorage.getItem(EVENTS_KEY)
            const events: Event[] = stored ? JSON.parse(stored) : []

            events.unshift(event)
            const trimmed = events.slice(0, MAX_EVENTS)

            localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed))
        } catch (e) {
            console.warn('Failed to store event:', e)
        }
    }

    static getPageViews(): PageView[] {
        try {
            const stored = localStorage.getItem(PAGE_VIEWS_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (e) {
            console.warn('Failed to retrieve page views:', e)
            return []
        }
    }

    static getEvents(): Event[] {
        try {
            const stored = localStorage.getItem(EVENTS_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (e) {
            console.warn('Failed to retrieve events:', e)
            return []
        }
    }

    static clearAll() {
        try {
            localStorage.removeItem(PAGE_VIEWS_KEY)
            localStorage.removeItem(EVENTS_KEY)
        } catch (e) {
            console.warn('Failed to clear analytics:', e)
        }
    }

    static exportData() {
        return {
            pageViews: this.getPageViews(),
            events: this.getEvents(),
            exportedAt: new Date().toISOString()
        }
    }
}
