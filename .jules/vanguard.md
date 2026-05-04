# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: When implementing RLS for public-facing submission tables (e.g., `contact_submissions`), ensure that `SELECT` access is restricted to administrative roles. Allowing all `authenticated` users to read these tables can lead to data leaks if the app is multi-tenant or has different user tiers.
