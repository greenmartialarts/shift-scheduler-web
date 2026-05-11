# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Global tables (like `contact_submissions`) that allow public `INSERT` must be explicitly audited for `SELECT` policies. Defaulting to `authenticated` users can lead to data leaks if administrative data is mixed with public submissions. Always restrict administrative access to users in the `event_admins` table.
