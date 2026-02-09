'use server'

import { createHash } from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expectedHash = process.env.ANALYTICS_PASSWORD_HASH

    if (!expectedHash) {
        console.error('ANALYTICS_PASSWORD_HASH is not set. Access blocked.')
        return { error: 'Analytics access is not configured.' }
    }

    // Hash the provided password
    const inputHash = createHash('sha256').update(password).digest('hex')

    if (inputHash === expectedHash) {
        return { success: true }
    }

    return { error: 'Incorrect password' }
}
