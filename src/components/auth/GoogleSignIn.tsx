'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()
    const containerRef = useRef<HTMLDivElement>(null)

    const handleIdToken = async (response: any) => {
        console.log('Google credential received, signing in with Supabase...')

        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            })

            if (error) {
                console.error('Supabase sign-in error:', error)
                throw error
            }

            console.log('Supabase sign-in successful:', data)

            if (onSuccess) {
                onSuccess()
            }
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
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleIdToken,
                ux_mode: 'popup',
                auto_select: false,
            })
            window.google.accounts.id.renderButton(containerRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
            })
        }
    }

    useEffect(() => {
        if (window.google) {
            initializeGoogleSignIn()
        }
    }, [])

    return (
        <div className="w-full">
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={initializeGoogleSignIn}
            />
            <div
                ref={containerRef}
                className={`w-full flex justify-center min-h-[44px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            />
            {isLoading && (
                <p className="text-center text-xs text-zinc-500 mt-2">
                    Verifying with Supabase...
                </p>
            )}
        </div>
    )
}
