# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-01-16**: Discovered that previous audit reports may claim fixes that were not actually committed or merged into the codebase. Always verify the actual code against reported status to ensure security and performance improvements are truly in place.
