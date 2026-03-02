'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH
    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set. Set it in environment variables to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    const hashedInput = crypto.createHash('sha256').update(password).digest('hex')

    if (hashedInput === expectedHash) {
        return { success: true }
    }
    return { error: 'Incorrect password' }
}
