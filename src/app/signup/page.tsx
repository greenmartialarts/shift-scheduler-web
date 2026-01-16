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

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                                    Continue with Google
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                const { createClient } = await import('@/lib/supabase/client')
                                const supabase = createClient()
                                await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`
                                    }
                                })
                            }}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

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
