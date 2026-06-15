'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH
    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in environment variables to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    const inputHash = crypto.createHash('sha256').update(password).digest('hex')

    try {
        const inputBuffer = Buffer.from(inputHash)
        const expectedBuffer = Buffer.from(expectedHash)

        if (inputBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(inputBuffer, expectedBuffer)) {
            return { success: true }
        }
    } catch (e) {
        console.error('Error during password verification:', e)
    }

    return { error: 'Incorrect password' }
}
