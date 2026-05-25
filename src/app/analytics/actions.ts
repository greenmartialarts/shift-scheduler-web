'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const hash = process.env.ANALYTICS_PASSWORD_HASH
    if (!hash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    try {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex')
        const bufferA = Buffer.from(inputHash)
        const bufferB = Buffer.from(hash)

        if (bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB)) {
            return { success: true }
        }
    } catch (e) {
        console.error('Password verification error:', e)
    }

    return { error: 'Incorrect password' }
}
