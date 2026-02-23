# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-02-05**: Identified a regression where a previously documented security fix (password hashing) was either not applied or reverted to plain text comparison. This highlights the necessity of "Phase 1" scans even for "fixed" issues. Additionally, discovered that N+1 query patterns in dashboard stats can significantly impact performance when called in a loop from client components.
