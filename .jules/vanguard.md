# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Restrict `SELECT` access on public-facing submission tables (e.g., `contact_submissions`) to administrative roles via RLS policies to prevent sensitive data exposure to unauthorized users.
