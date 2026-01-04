'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { LoginSchema, SignupSchema } from '@/lib/schemas'
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rate-limit'

export async function login(prevState: string | undefined, formData: FormData) {
    const supabase = await createClient()

    // Validate input with Zod
    const parsed = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!parsed.success) {
        return parsed.error.issues[0].message
    }

    const { email, password } = parsed.data

    // Check rate limit
    const rateLimitCheck = checkRateLimit(email)
    if (!rateLimitCheck.allowed) {
        return 'Too many login attempts. Please try again in 10 minutes.'
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        recordFailedAttempt(email)
        return "Invalid login credentials"
    }

    // Success - clear rate limit
    clearRateLimit(email)

    revalidatePath('/', 'layout')
    redirect('/events')
}

export async function signup(prevState: string | undefined, formData: FormData) {
    const supabase = await createClient()

    // Validate input with Zod
    const parsed = SignupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!parsed.success) {
        return parsed.error.issues[0].message
    }

    const { email, password } = parsed.data

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return error.message
    }

    revalidatePath('/', 'layout')
    redirect('/events')
}
