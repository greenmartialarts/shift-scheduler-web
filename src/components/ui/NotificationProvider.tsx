'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { PremiumButton } from './PremiumButton'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: NotificationType
}

interface ConfirmOptions {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'primary'
}

interface NotificationContextType {
    showAlert: (message: string, type?: NotificationType) => void
    showConfirm: (options: ConfirmOptions) => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const [confirm, setConfirm] = useState<{
        options: ConfirmOptions
        resolve: (value: boolean) => void
    } | null>(null)

    const showAlert = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }, [])

    const showConfirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirm({ options, resolve })
        })
    }, [])

    const handleConfirm = (value: boolean) => {
        if (confirm) {
            confirm.resolve(value)
            setConfirm(null)
        }
    }

    return (
        <NotificationContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* Toasts Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                            className={`pointer-events-auto flex items-center gap-3 rounded-md border p-4 shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-white border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100' :
                                toast.type === 'error' ? 'bg-white border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100' :
                                    toast.type === 'warning' ? 'bg-white border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100' :
                                        'bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100'
                                }`}
                        >
                            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                            {toast.type === 'info' && <Info className="h-5 w-5 text-slate-500" />}

                            <p className="text-sm font-medium">{toast.message}</p>

                            <button
                                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                                className="ml-2 rounded-full p-1 opacity-50 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleConfirm(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        >
                            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                                {confirm.options.title}
                            </h3>
                            <p className="mb-6 text-slate-600 dark:text-slate-400">
                                {confirm.options.message}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => handleConfirm(false)}
                                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {confirm.options.cancelText || 'Cancel'}
                                </button>
                                <PremiumButton
                                    onClick={() => handleConfirm(true)}
                                    variant={confirm.options.type === 'danger' ? 'danger' : 'primary'}
                                >
                                    {confirm.options.confirmText || 'Confirm'}
                                </PremiumButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    )
}
