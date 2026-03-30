'use server'

import { createHash, timingSafeEqual } from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH
    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        // Use binary buffers for more efficient timing-safe comparison
        const inputBuffer = createHash('sha256').update(password).digest()
        const expectedBuffer = Buffer.from(expectedHash, 'hex')

        if (inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer)) {
            return { success: true }
        }
    } catch (e) {
        console.error('Analytics verification error:', e)
    }

    return { error: 'Incorrect password' }
}
