# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Identified that public-facing tables (like `contact_submissions`) often default to overly permissive `authenticated` SELECT policies during rapid development. Standardizing on `event_admins` table checks for administrative RLS is a more secure pattern than relying on generic authentication.
