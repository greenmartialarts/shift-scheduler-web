'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorLogger } from '@/lib/errorLogger'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to our error logger
        ErrorLogger.log(error, {
            componentStack: errorInfo.componentStack || undefined
        })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full">
                        <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>

                            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-3">
                                Something went wrong
                            </h1>

                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>

                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>

                            <p className="text-xs text-zinc-400 mt-6">
                                If this problem persists, please contact support.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
