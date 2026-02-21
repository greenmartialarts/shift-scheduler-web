# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-02-09**: Discovered that security fixes documented in historical audit reports may be regressed or never fully applied in the actual codebase. Always verify that previously "fixed" vulnerabilities (like plain-text password comparisons) remain secure in the current branch.
