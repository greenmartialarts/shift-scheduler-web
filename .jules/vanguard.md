# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Verified that relying on cleartext environment variables for sensitive authentication (e.g., `ANALYTICS_PASSWORD`) is a regression risk. Refactored to SHA-256 hashing with timing-safe comparisons to prevent timing attacks and cleartext exposure in process listings or logs.
