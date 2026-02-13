'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Script from 'next/script'

interface GoogleSignInProps {
    onSuccess?: () => void
    onError?: (error: any) => void
}

declare global {
    interface Window {
        google: any
    }
}

export function GoogleSignIn({ onSuccess, onError }: GoogleSignInProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSdkLoaded, setIsSdkLoaded] = useState(false)
    const supabase = createClient()
    const containerRef = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()

    const handleIdToken = async (response: any) => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            })

            if (error) throw error
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error('Error signing in with Google:', error)
            if (onError) onError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const initializeGoogleSignIn = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

        if (window.google && containerRef.current) {
            // Clear container to prevent duplicate buttons on re-render
            containerRef.current.innerHTML = ''

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleIdToken,
                ux_mode: 'popup',
                auto_select: false,
                cancel_on_tap_outside: true,
                itp_support: true,
                context: 'signin',
                use_fedcm_for_prompt: true, // Modern standard for better browser integration
            })

            // Render the button with specific dark mode adjustments
            window.google.accounts.id.renderButton(containerRef.current, {
                // 'filled_black' is the official dark theme
                theme: theme === 'dark' ? 'filled_black' : 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                width: containerRef.current.offsetWidth || 300,
                // Removing logo_alignment: 'left' as it sometimes forces a white background on the G logo
            })

            // Also show the "One Tap" prompt
            // Note: Google may suppress this if the user has closed it recently
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    console.log('One Tap not displayed:', notification.getNotDisplayedReason())
                }
            })

            setIsSdkLoaded(true)
        }
    }

    // Initialize when SDK loads or theme changes
    useEffect(() => {
        if (window.google) {
            initializeGoogleSignIn()
        }
    }, [theme])

    // Re-render button on window resize to keep it full-width
    useEffect(() => {
        const handleResize = () => {
            if (window.google) initializeGoogleSignIn()
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [theme])

    return (
        <div className="w-full max-w-sm mx-auto">
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={initializeGoogleSignIn}
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative group"
            >
                <div
                    ref={containerRef}
                    className={`w-full flex justify-center transition-all duration-300 ${isLoading ? 'opacity-20 grayscale pointer-events-none scale-95' : 'hover:scale-[1.01]'
                        }`}
                    style={{ minHeight: '44px' }}
                />

                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Authenticating
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {!isSdkLoaded && !isLoading && (
                <div className="w-full h-[44px] animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-full" />
            )}
        </div>
    )
}
