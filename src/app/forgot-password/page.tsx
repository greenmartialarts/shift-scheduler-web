'use client'

import { useActionState } from 'react'
import { resetPassword } from './actions'
import Link from 'next/link'
import { PremiumInput } from '@/components/ui/PremiumInput'
import { PremiumButton } from '@/components/ui/PremiumButton'

export default function ForgotPasswordPage() {
    const [message, formAction, isPending] = useActionState(resetPassword, undefined)

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden">
            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
                        Reset Password
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Enter your email to receive a reset link
                    </p>
                </div>

                <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
                    <form action={formAction} className="space-y-6">
                        {message && (
                            <div
                                className={`rounded-2xl p-4 border ${message.includes('Could not')
                                    ? 'bg-red-50/50 border-red-200/50 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200'
                                    : 'bg-green-50/50 border-green-200/50 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-200'
                                    }`}
                            >
                                <p className="text-sm font-semibold text-center">
                                    {message}
                                </p>
                            </div>
                        )}

                        <PremiumInput
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            required
                        />

                        <PremiumButton
                            type="submit"
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? 'Sending...' : 'Send Reset Link'}
                        </PremiumButton>

                        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                            Remember your password?{' '}
                            <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
