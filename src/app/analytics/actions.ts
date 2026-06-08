'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH
    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex')

        // Use timingSafeEqual to prevent timing attacks
        // Both buffers must be the same length for timingSafeEqual
        const buffer1 = Buffer.from(inputHash)
        const buffer2 = Buffer.from(expectedHash)

        if (buffer1.length === buffer2.length && crypto.timingSafeEqual(buffer1, buffer2)) {
            return { success: true }
        }
    } catch (err) {
        console.error('Error verifying analytics password:', err)
    }

    return { error: 'Incorrect password' }
}
