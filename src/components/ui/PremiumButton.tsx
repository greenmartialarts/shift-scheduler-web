'use client'

import { ReactNode } from 'react'

interface PremiumButtonProps {
    children: ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    className?: string
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export function PremiumButton({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
    variant = 'primary'
}: PremiumButtonProps) {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
        secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500'
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 
                disabled:cursor-not-allowed flex items-center justify-center gap-2
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </button>
    )
}
