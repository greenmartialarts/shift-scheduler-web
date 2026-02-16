# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-01-16**: Security regressions can occur if previous manual fixes (like SHA-256 hashing) are not backed by lint rules or automated tests. Always verify historical fixes against the current codebase during audits, as they may have been reverted or incorrectly reported.
