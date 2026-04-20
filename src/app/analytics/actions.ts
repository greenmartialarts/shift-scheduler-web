'use server'

import { createHash, timingSafeEqual } from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH
    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in your environment to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    const inputHash = createHash('sha256').update(password).digest('hex')
    const inputBuffer = Buffer.from(inputHash)
    const expectedBuffer = Buffer.from(expectedHash)

    if (inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer)) {
        return { success: true }
    }
    return { error: 'Incorrect password' }
}
