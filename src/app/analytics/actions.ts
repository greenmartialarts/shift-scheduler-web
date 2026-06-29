'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    let expectedHash = process.env.ANALYTICS_PASSWORD_HASH

    // Backward compatibility with legacy ANALYTICS_PASSWORD
    if (!expectedHash && process.env.ANALYTICS_PASSWORD) {
        expectedHash = crypto.createHash('sha256').update(process.env.ANALYTICS_PASSWORD).digest('hex')
    }

    if (!expectedHash) {
        console.warn('Neither ANALYTICS_PASSWORD_HASH nor ANALYTICS_PASSWORD is set.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex')

        const inputBuffer = Buffer.from(inputHash)
        const expectedBuffer = Buffer.from(expectedHash)

        if (inputBuffer.length === expectedBuffer.length &&
            crypto.timingSafeEqual(inputBuffer, expectedBuffer)) {
            return { success: true }
        }
    } catch (err) {
        console.error('Error during password verification:', err)
    }

    return { error: 'Incorrect password' }
}
