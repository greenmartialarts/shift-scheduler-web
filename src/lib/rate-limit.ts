// In-memory rate limiter for login attempts
// Tracks failed login attempts by email

type RateLimitEntry = {
    attempts: number
    resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up expired entries every 10 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) {
            rateLimitMap.delete(key)
        }
    }
}, 10 * 60 * 1000)

export function checkRateLimit(email: string): { allowed: boolean; remainingAttempts?: number } {
    const now = Date.now()
    const entry = rateLimitMap.get(email.toLowerCase())

    // No entry or expired - allow
    if (!entry || now > entry.resetAt) {
        return { allowed: true, remainingAttempts: 5 }
    }

    // Too many attempts
    if (entry.attempts >= 5) {
        return { allowed: false }
    }

    // Still within limit
    return { allowed: true, remainingAttempts: 5 - entry.attempts }
}

export function recordFailedAttempt(email: string): void {
    const now = Date.now()
    const resetAt = now + 10 * 60 * 1000 // 10 minutes
    const entry = rateLimitMap.get(email.toLowerCase())

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(email.toLowerCase(), { attempts: 1, resetAt })
    } else {
        entry.attempts++
    }
}

export function clearRateLimit(email: string): void {
    rateLimitMap.delete(email.toLowerCase())
}
