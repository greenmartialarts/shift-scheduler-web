'use client'

/**
 * Free, self-hosted error logging utility
 * Logs errors to console and localStorage for debugging
 */

interface ErrorLog {
    id: string
    timestamp: string
    message: string
    stack?: string
    componentStack?: string
    url: string
    userAgent: string
}

const MAX_ERRORS = 100
const STORAGE_KEY = 'app_error_logs'

export class ErrorLogger {
    static log(error: Error, errorInfo?: { componentStack?: string }) {
        const errorLog: ErrorLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo?.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        }

        // Log to console with styling
        console.group(`🔴 Error: ${error.message}`)
        console.error('Message:', error.message)
        console.error('Stack:', error.stack)
        if (errorInfo?.componentStack) {
            console.error('Component Stack:', errorInfo.componentStack)
        }
        console.error('URL:', errorLog.url)
        console.error('Timestamp:', errorLog.timestamp)
        console.groupEnd()

        // Store in localStorage
        this.storeError(errorLog)
    }

    private static storeError(errorLog: ErrorLog) {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            const errors: ErrorLog[] = stored ? JSON.parse(stored) : []

            // Add new error and keep only the most recent MAX_ERRORS
            errors.unshift(errorLog)
            const trimmed = errors.slice(0, MAX_ERRORS)

            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
        } catch (e) {
            console.warn('Failed to store error in localStorage:', e)
        }
    }

    static getErrors(): ErrorLog[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (e) {
            console.warn('Failed to retrieve errors from localStorage:', e)
            return []
        }
    }

    static clearErrors() {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
            console.warn('Failed to clear errors from localStorage:', e)
        }
    }
}

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        ErrorLogger.log(event.error || new Error(event.message))
    })

    window.addEventListener('unhandledrejection', (event) => {
        ErrorLogger.log(new Error(`Unhandled Promise Rejection: ${event.reason}`))
    })
}
