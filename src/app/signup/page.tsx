'use client'

import { signup } from '../login/actions'
import Link from 'next/link'
import { PremiumInput } from '@/components/ui/PremiumInput'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { useActionState } from 'react'
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal'

export default function SignupPage() {
    const [errorMessage, formAction, isPending] = useActionState(signup, undefined)

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden">
            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
                        Get Started
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Create your account to start scheduling
                    </p>
                </div>

                <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
                    <form action={formAction} className="space-y-6">
                        {errorMessage && (
                            <div className="rounded-2xl bg-red-50/50 p-4 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                                <p className="text-sm font-semibold text-red-800 dark:text-red-200 text-center">
                                    {errorMessage}
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

                        <PremiumInput
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            required
                        />

                        <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 -mt-2">
                            <p>Password requirements:</p>
                            <ul className="list-disc list-inside ml-2 space-y-0.5">
                                <li>At least 12 characters</li>
                                <li>Include uppercase, lowercase, number, and special character</li>
                            </ul>
                        </div>

                        <PremiumButton
                            type="submit"
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? 'Creating...' : 'Create Account'}
                        </PremiumButton>

                        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                                Sign In
                            </Link>
                        </p>

                        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 pt-4">
                            By creating an account, you agree to our <PrivacyPolicyModal />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
