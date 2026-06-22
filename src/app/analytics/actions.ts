'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH

    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in environment variables to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex')

        const bufferInput = Buffer.from(inputHash)
        const bufferExpected = Buffer.from(expectedHash)

        if (bufferInput.length === bufferExpected.length && crypto.timingSafeEqual(bufferInput, bufferExpected)) {
            return { success: true }
        }
    } catch (err) {
        console.error('Error verifying analytics password:', err)
        return { error: 'An error occurred during verification.' }
    }

    return { error: 'Incorrect password' }
}
