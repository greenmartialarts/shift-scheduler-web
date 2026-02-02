'use server'

export async function verifyAnalyticsPassword(password: string): Promise<{ success?: boolean; error?: string }> {
    const expected = process.env.ANALYTICS_PASSWORD
    if (!expected) {
        console.warn('ANALYTICS_PASSWORD is not set. Set it in .env.local to protect the analytics page.')
        return { error: 'Analytics access is not configured.' }
    }
    if (password === expected) {
        return { success: true }
    }
    return { error: 'Incorrect password' }
}
