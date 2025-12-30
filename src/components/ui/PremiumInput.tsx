import { InputHTMLAttributes } from 'react'

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function PremiumInput({ label, error, className = '', ...props }: PremiumInputProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={`
                    block w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 
                    px-4 py-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm
                    placeholder-zinc-400 dark:placeholder-zinc-600 
                    focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 
                    dark:text-white
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                    ${className}
                `}
            />
            {error && (
                <p className="text-xs font-medium text-red-500 ml-1 mt-1">{error}</p>
            )}
        </div>
    )
}
