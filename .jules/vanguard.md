# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-05-25**: Identified that administrative RLS for global tables (e.g., `contact_submissions`) requires filtering by existence in the `event_admins` table when a specific `event_id` relationship is not present, to prevent data leaks to general authenticated users.
