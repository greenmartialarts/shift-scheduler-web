# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Restricting RLS `SELECT` access on public-facing submission tables (e.g., `contact_submissions`) to users verified in the `event_admins` table is critical to prevent unauthorized data exposure that occurs with standard `authenticated` policies.
