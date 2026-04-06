# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Found that server actions may still use cleartext password comparisons if legacy code is not migrated to secure hashing. Always implement `crypto.timingSafeEqual` with SHA-256 hashes for any administrative authentication bypasses or dashboard protections.
