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

        // Use timingSafeEqual to prevent timing attacks
        // Both need to be Buffers of the same length
        const inputBuffer = Buffer.from(inputHash)
        const expectedBuffer = Buffer.from(expectedHash)

        if (inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer)) {
            return { success: true }
        }
    } catch (err) {
        console.error('Error verifying analytics password:', err)
    }

    return { error: 'Incorrect password' }
}
