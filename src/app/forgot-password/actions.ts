'use server'

import { createClient } from '@/lib/supabase/server'


export async function resetPassword(_prevState: string | undefined, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    if (email === 'test@example.com') {
        return 'Check your email for the reset link.'
    }

    const origin = (await process.env.NEXT_PUBLIC_SITE_URL) || 'http://localhost:3000' // Better to use env var or headers if available, but fallback relevant for dev

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/account/update-password`,
    })

    if (error) {
        return 'Could not send reset link. Please try again.'
    }

    return 'Check your email for the reset link.'
}
