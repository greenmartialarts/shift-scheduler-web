'use client'

import { useActionState } from 'react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(login, undefined)

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                        Sign up
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10 transition-colors duration-200">
                    <form action={formAction} className="space-y-6">
                        {errorMessage && (
                            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                            {errorMessage}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                disabled={isPending}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        For Testing
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                        <p>Use these credentials to test the site:</p>
                                        <ul className="list-disc pl-5 space-y-1 mt-1">
                                            <li>Email: test@example.com</li>
                                            <li>Password: test123</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
