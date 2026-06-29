# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-10**: Identified a security regression where analytics authentication used direct string comparison instead of timing-safe buffer comparison. Even when using hashes, timing attacks can leak information about the hash itself. Standardized on `crypto.timingSafeEqual` for all server-side credential verification.
