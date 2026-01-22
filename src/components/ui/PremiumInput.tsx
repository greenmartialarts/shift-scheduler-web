import { InputHTMLAttributes } from 'react'

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function PremiumInput({ label, error, className = '', ...props }: PremiumInputProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={`
                    block w-full rounded-md border border-slate-300 dark:border-slate-700 
                    px-3 py-2 bg-white dark:bg-slate-900
                    placeholder-slate-400 dark:placeholder-slate-500
                    text-sm
                    focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 
                    dark:text-white
                    disabled:bg-slate-50 disabled:text-slate-500
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
            />
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </div>
    )
}
