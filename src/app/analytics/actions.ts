'use server'

import { createHash, timingSafeEqual } from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH
    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    const hash = createHash('sha256').update(password).digest('hex')
    const bufferHash = Buffer.from(hash)
    const bufferExpected = Buffer.from(expectedHash)

    if (bufferHash.length === bufferExpected.length && timingSafeEqual(bufferHash, bufferExpected)) {
        return { success: true }
    }
    return { error: 'Incorrect password' }
}
