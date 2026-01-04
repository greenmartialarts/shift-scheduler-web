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
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-100' :
                                    toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-800 dark:text-red-100' :
                                        toast.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-100' :
                                            'bg-indigo-50/90 border-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-100'
                                }`}
                        >
                            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                            {toast.type === 'info' && <Info className="h-5 w-5 text-indigo-500" />}

                            <p className="text-sm font-medium">{toast.message}</p>

                            <button
                                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                                className="ml-2 rounded-full p-1 opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
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
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90"
                        >
                            <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
                                {confirm.options.title}
                            </h3>
                            <p className="mb-8 text-zinc-600 dark:text-zinc-400">
                                {confirm.options.message}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => handleConfirm(false)}
                                    className="rounded-2xl px-6 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all"
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
