# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Identified that standard 'authenticated' RLS policies on public-facing submission tables (like contact_submissions) are insufficient in multi-tenant environments. Always restrict SELECT access to a specific administrative role or table (e.g., event_admins) to prevent data leakage between unrelated users.
