import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // In production (Render/Vercel), 'origin' might be the internal container URL (e.g. localhost:10000)
    // We want the public facing URL.
    // 1. Try NEXT_PUBLIC_SITE_URL env var if set
    // 2. Try 'x-forwarded-host' header
    // 3. Fallback to request host
    const forwardedHost = request.headers.get('x-forwarded-host')
    const host = forwardedHost || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'

    // Construct the correct origin
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to events page after successful authentication
    return NextResponse.redirect(`${origin}/events`)
}
