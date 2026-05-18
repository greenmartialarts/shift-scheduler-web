'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const hash = process.env.ANALYTICS_PASSWORD_HASH

    if (!hash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in environment variables to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex')

        // Use timingSafeEqual to prevent timing attacks
        // Both values must be converted to Buffers of the same length
        const inputBuffer = Buffer.from(inputHash)
        const targetBuffer = Buffer.from(hash)

        if (inputBuffer.length === targetBuffer.length && crypto.timingSafeEqual(inputBuffer, targetBuffer)) {
            return { success: true }
        }
    } catch (err) {
        console.error('Error verifying analytics password:', err)
    }

    return { error: 'Incorrect password' }
}
