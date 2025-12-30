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
        primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:ring-zinc-500',
        danger: 'bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-500'
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                px-6 py-3 rounded-2xl text-sm font-bold transition-shadow duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 
                disabled:cursor-not-allowed flex items-center justify-center gap-2
                active:scale-[0.98]
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </button>
    )
}
