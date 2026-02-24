'use server'

import { createHash } from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH

    if (!expectedHash) {
        console.warn('ANALYTICS_PASSWORD_HASH is not set.')
        return { error: 'Analytics access is not configured.' }
    }

    const hash = createHash('sha256').update(password).digest('hex')

    if (hash === expectedHash) {
        return { success: true }
    }
    return { error: 'Incorrect password' }
}
