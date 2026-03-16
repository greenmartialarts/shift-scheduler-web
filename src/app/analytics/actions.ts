'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH

    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    const inputHash = crypto.createHash('sha256').update(password).digest('hex')

    // Timing-safe comparison to prevent timing attacks
    // We compare buffers to use timingSafeEqual
    const expectedBuffer = Buffer.from(expectedHash, 'hex')
    const inputBuffer = Buffer.from(inputHash, 'hex')

    if (expectedBuffer.length === inputBuffer.length &&
        crypto.timingSafeEqual(inputBuffer, expectedBuffer)) {
        return { success: true }
    }

    return { error: 'Incorrect password' }
}
