'use server'

import { createHash, timingSafeEqual } from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH

    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        const inputHash = createHash('sha256').update(password).digest('hex')

        // Timing-safe comparison to prevent timing attacks
        const buf1 = Buffer.from(inputHash)
        const buf2 = Buffer.from(expectedHash)

        if (buf1.length === buf2.length && timingSafeEqual(buf1, buf2)) {
            return { success: true }
        }
    } catch (error) {
        console.error('Error verifying analytics password:', error)
    }

    return { error: 'Incorrect password' }
}
