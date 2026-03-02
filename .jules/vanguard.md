# Vanguard Journal

## Critical Learnings
- **2026-01-15**: Discovered that hardcoded security hashes (SHA-256) are often accompanied by cleartext password comments during development, which may survive into production if not explicitly audited. Always perform a grep for specific hash strings and adjacent comments during security scans.
- **2026-02-05**: Critical Learning: Security regressions can occur when previously implemented security patterns (like hashing) are reverted to plain-text comparisons during development or refactoring. Always verify current security implementations against historical audit records to ensure no degradation in security standards.
