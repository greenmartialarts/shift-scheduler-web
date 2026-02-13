'use client'

import { useActionState } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { PremiumInput } from '@/components/ui/PremiumInput'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal'
import { GoogleSignIn } from '@/components/auth/GoogleSignIn'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(login, undefined)
    const router = useRouter()

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden">
            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Sign in to manage your events effortlessly
                    </p>
                </div>

                <div className="glass-panel rounded-xl p-8 sm:p-10 shadow-lg">
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

                        <div className="space-y-1">
                            <PremiumInput
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                required
                            />
                            <div className="flex justify-end pr-1">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <PremiumButton
                            type="submit"
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? 'Verifying...' : 'Sign In'}
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

                        <div className="w-full flex justify-center">
                            <GoogleSignIn
                                onSuccess={() => window.location.href = '/events'}
                                onError={(err) => console.error(err)}
                            />
                        </div>

                        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 transition-colors">
                                Create one
                            </Link>
                        </p>

                        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 pt-4">
                            By signing in, you agree to our <PrivacyPolicyModal />
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
                                <div className="rounded-xl bg-blue-50/50 p-4 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
                                    <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2">
                                        Demo Credentials
                                    </h3>
                                    <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400/80">
                                        <p className="flex justify-between"><span>Email:</span> <span className="font-mono font-medium">test@example.com</span></p>
                                        <p className="flex justify-between"><span>Pass:</span> <span className="font-mono font-medium">test123</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
