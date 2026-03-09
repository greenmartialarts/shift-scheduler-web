# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-03-09**: Identified that public-facing submission tables (like `contact_submissions`) often have overly permissive `SELECT` policies by default (e.g., `TO authenticated USING (true)`), which can leak sensitive user data to any logged-in user. Always restrict `SELECT` access to specific administrative roles or event owners.
