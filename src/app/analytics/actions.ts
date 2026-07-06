'use server'

import crypto from 'crypto'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const passwordHash = process.env.ANALYTICS_PASSWORD_HASH
    const legacyPassword = process.env.ANALYTICS_PASSWORD

    if (!passwordHash && !legacyPassword) {
        console.warn('Neither ANALYTICS_PASSWORD_HASH nor ANALYTICS_PASSWORD is set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }

    const inputHash = crypto.createHash('sha256').update(password).digest()

    let expectedHash: Buffer
    if (passwordHash) {
        try {
            expectedHash = Buffer.from(passwordHash, 'hex')
        } catch {
            console.error('Invalid ANALYTICS_PASSWORD_HASH format. Expected hex string.')
            return { error: 'Server configuration error.' }
        }
    } else {
        // Fallback to hashing the legacy password
        expectedHash = crypto.createHash('sha256').update(legacyPassword!).digest()
    }

    if (inputHash.length === expectedHash.length && crypto.timingSafeEqual(inputHash, expectedHash)) {
        return { success: true }
    }

    return { error: 'Incorrect password' }
}
